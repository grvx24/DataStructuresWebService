var dynamic_multigraph = function(option){

    "use strict";

    // INPUT

    option = $.extend(true, {
        data : {"nodes":[],"links":[]},
        radius : 20,
        stroke : 5,
        force1 : {
            distance : function (l, i) { return (l.distance + 1) * 35; },
            charge : function (v, i) { return v.weight ? -30 * (v.weight + 5) : -500 ; },
            gravity : 0.005,
            friction : 0.7
        },
        force2 : {
            distance : function (l) { return l.cyclic ? l.distance * 25 : (l.distance + 1) * 10; },
            gravity : 0.0, // JUST A TAD OF GRAVITY TO HELP KEEP THOSE CURVY BUTTOCKS DECENT
            charge : function (d, i) {
                // HELPER NODES HAVE A MEDIUM-TO-HIGH CHARGE, DEPENDING ON THE NUMBER OF LINKS THE RELATED FORCE LINK REPRESENTS.
                // HENCE BUNDLES OF LINKS FRO A->B WILL HAVE HELPER NODES WITH HUGE CHARGES: BETTER SPREADING OF THE LINK PATHS.
                //
                if (d.fixed) return -10;
                var l = d.link_ref, c = l.link_count || 1;
                if (l.source.link_count > 0 || l.target.link_count > 0) return -30;
                return -1;
            },
            friction : 0.95
        },
        zoom_range : [0.1, 10],
        loop_curve : 0.5,
        pathgen : d3.svg.line().interpolate("basis"),
        cycle_pathgen : d3.svg.line().interpolate("basis"),
        bcolor : 'rgba(0,0,0,0)',
        nodeid : function (n) { return n.name; },
        fast_stop_threshold : 0.0
    }, option);

    var width = option.width,
        height = option.height,
        debug = option.debug, // 0: DISABLE, 1: ALL, 2: ONLY FORCE2 + CURVES, 3: CURVES ONLY
        pathgen = option.pathgen,
        cycle_pathgen = option.cycle_pathgen,
        data = option.data,
        root = option.root,
        radius = option.radius, // DEFAULT POINT RADIUS
        // CYCLIC ~ SELF-REFERENTIAL LINKS: DETERMINES THE 'RADIUS' OF
        // THE BEZIER PATH CONSTRUCTED FOR THE LINK;
        cycle_curvep = option.loop_curve,
        bcolor = option.bcolor;

    // ==



    // PREPARE DATA STRUCT TO ALSO CARRY OUR 'PATH HELPER NODES':

    data.helpers = {
        left: {},
        right: {},
        cyclic: {}
    };

    // ==



    // INIT SVG ROOT ELEMENT

    var vis = d3.select(root).append('svg').attr("width", width).attr("height", height);

    var debug_g = vis.append("g").attr("class", "debug_g");
    var path_trace_alpha = debug_g.append("path").attr("class", "trace-alpha");
    var path_trace_c2 = debug_g.append("path").attr("class", "trace-c2");

    var superwrap = vis.append("g").attr("width", width).attr("height", height);

    var background = superwrap.append('svg:rect')
        .attr("width", width)
        .attr("height", height)
        .attr('fill', bcolor);

    var wrap = superwrap.append("g").attr("width", width).attr("height", height);



    var linkg = wrap.append("g").attr("class", "linkg");
    var helper_nodeg = wrap.append("g").attr("class", "helper_nodeg");


    var center_of_mass = wrap.append("g")
        .attr("class", "center-of-mass")
        .append("circle")
        .attr("class", "center-of-mass")
        .attr("visibility", (debug == 1) ? "visible" : "hidden")
        .attr("r", 10);

    var helper_linkg = wrap.append("g").attr("class", "helper_linkg");
    var nodeg = wrap.append("g").attr("class", "nodeg");

    var edge_text = wrap.append("g").attr("class", "edge-text");



    // ==



    // LOCAL VARIABLES

    var link, hlink, etext,
        hnode,
        alpha_trace = [],
        alpha_line, alpha_scale,
        c2_trace = [],
        c2_line, c2_scale;

    // ==



    // DRAWING TOOLS

    alpha_line = d3.svg.line()
        .x(function (d, i) { return i; })
        .y(function (d, i) { return d; });

    alpha_scale = d3.scale.pow()
        .exponent(-1.0)
        .domain([5, 0.005])
        .range([10, height - 10])
        .clamp(true);

    c2_scale = d3.scale.log()
        .domain([0.01, width * height])
        .range([10, height - 10])
        .clamp(true);

    c2_line = d3.svg.line()
        .x(function (d, i) { return i; })
        .y(function (d, i) { return d; });

    var fill = d3.scale.category20();

    // ==



    // ID GENERATORS

    var nodeid = option.nodeid;

    var linkid = function (l) {
        var u = nodeid(l.source), v = nodeid(l.target);
        return u < v ? u + "|" + v : v + "|" + u;
    };

    // ==



    // INIT DATA STRUCTURES
    var nm = {}, // NODE MAP
        nml = {}, // NODE MAP FOR LEFT-SIDE 'LINK PATH HELPER NODES'
        nmr = {}, // NODE MAP FOR RIGHT-SIDE 'LINK PATH HELPER NODES'
        nmc = {}, // NODE MAP FOR CYCLIC ~ SELF-REFERENCING 'LINK PATH HELPER NODES'
        nmimg = {}, // NODE MAP FOR CLONED NODES FOR FORCE2
        lm = {}, // LINK MAPS - LM ~ LML-LMM-LMR
        lml = {},
        lmm = {},
        lmr = {},
        lmc = {},
        nodes = [], // OUTPUT NODES
        helper_nodes = []; // HELPER FORCE GRAPH NODES


    var PREV_UUID = -1;
    var uuid = function(){ return ++PREV_UUID; };

    var add_edge = function (net, e) {
        var u, v,
            rui, rvi, ui, vi, lu, rv, uimg, vimg,
            i, ix,
            l, ll, l_, lr;

        // WHILE D3.LAYOUT.FORCE DOES CONVERT LINK.SOURCE AND LINK.TARGET NUMERIC VALUES TO DIRECT NODE REFERENCES,
        // IT DOESN'T FOR OTHER ATTRIBUTES, SUCH AS .REAL_SOURCE, SO WE DO NOT USE INDEXES IN NM[] BUT DIRECT NODE
        // REFERENCES TO SKIP THE D3.LAYOUT.FORCE IMPLICIT LINKS CONVERSION LATER ON AND ENSURE THAT BOTH .SOURCE/.TARGET
        // AND .REAL_SOURCE/.REAL_TARGET ARE OF THE SAME TYPE AND POINTING AT VALID NODES.
        rui = nodeid(e.source);
        rvi = nodeid(e.target);
        u = nm[rui];
        v = nm[rvi];
        if (u === v) {
            // SKIP NON-ORIGINAL LINKS FROM NODE TO SAME (A-A); THEY ARE RENDERED AS 0-LENGTH LINES ANYHOW. LESS LINKS IN ARRAY = FASTER ANIMATION.

            // SELF-REFERENTIAL 'LINKS' ARE PRODUCED AS 2 LINKS+1 HELPER NODE; THIS IS A GENERALIZED APPROACH SO WE
            // CAN SUPPORT MULTIPLE SELF-REFERENTIAL LINKS AS THANKS TO THE FORCE LAYOUT
            // THOSE HELPERS WILL ALL BE IN DIFFERENT PLACES, HENCE THE LINK 'PATH' FOR EACH
            // PARALLEL LINK WILL BE DIFFERENT.
            ui = nodeid(u);
            ix = ui + "|" + ui + "|" + uuid();
            l = lm[ix] || (lm[ix] = {
                source: u,
                target: u,
                size: 1,
                distance: e.weight || 1,
                cyclic : true,
                ix : ix
            });
            l.pos = net.links.push(l) - 1;
            // LINK(U,V) ==> U -> LU -> U
            lu = nmc[ix] ||
                (nmc[ix] = data.helpers.cyclic[ix] ||
                        (data.helpers.cyclic[ix] = {
                            ref: u,
                            id: "_ch_" + ix,
                            size: -1,
                            link_ref: l,
                            cyclic_helper: true
                        })
                );
            lu.pos = net.helper_nodes.push(lu) - 1;
            uimg = nmimg[ui];
            l_ = lmc[ix] || (lmc[ix] = {
                g_ref: l,
                ref: e,
                id: "c" + ix,
                source: uimg,
                target: lu,
                real_source: u,
                size: 1,
                distance: e.weight || 1,
                cyclic: true,
                ix : ix
            });
            l_.pos = net.helper_links.push(l_) - 1;
            l_.pos2 = net.helper_render_links.push(l_) - 1;
            return;
        }
        // 'LINKS' ARE PRODUCED AS 3 LINKS+2 HELPER NODES; THIS IS A GENERALIZED APPROACH SO WE
        // CAN SUPPORT MULTIPLE LINKS BETWEEN ELEMENT NODES, ALWAYS, AS EACH
        // 'ORIGINAL LINK' GETS ITS OWN SET OF 2 HELPER NODES AND THANKS TO THE FORCE LAYOUT
        // THOSE HELPERS WILL ALL BE IN DIFFERENT PLACES, HENCE THE LINK 'PATH' FOR EACH
        // PARALLEL LINK WILL BE DIFFERENT.
        ui = nodeid(u);
        vi = nodeid(v);


        ix = (ui < vi ? ui + "|" + vi : vi + "|" + ui) + "|" + uuid();
        l = lm[ix] || (lm[ix] = {
            source: u,
            target: v,
            size: 0,
            distance: e.weight || 1,
            ix : ix
        });
        if (l.pos === undefined) l.pos = net.links.push(l) - 1;

        // LINK(U,V) ==> U -> LU -> RV -> V
        lu = nml[ix] || (nml[ix] = data.helpers
            .left[ix] || (data.helpers.left[ix] = {
            ref: u,
            id: "_lh_" + ix,
            size: -1,
            link_ref: l,
            ix : ix
        }));
        if (lu.pos === undefined) lu.pos = net.helper_nodes.push(lu) - 1;
        rv = nmr[ix] || (nmr[ix] = data.helpers
            .right[ix] || (data.helpers.right[ix] = {
            ref: v,
            id: "_rh_" + ix,
            size: -1,
            link_ref: l,
            ix : ix
        }));
        if (rv.pos === undefined) rv.pos = net.helper_nodes.push(rv) - 1;
        uimg = nmimg[ui];
        vimg = nmimg[vi];
        ll = lml[ix] || (lml[ix] = {
            g_ref: l,
            ref: e,
            id: "l" + ix,
            source: uimg,
            target: lu,
            real_source: u,
            real_target: v,
            size: 0,
            distance: e.weight || 1,
            left_seg: true,
            ix : ix
        });
        if (ll.pos === undefined) ll.pos = net.helper_links.push(ll) - 1;
        l_ = lmm[ix] || (lmm[ix] = {
            g_ref: l,
            ref: e,
            id: "m" + ix,
            source: lu,
            target: rv,
            real_source: u,
            real_target: v,
            size: 0,
            distance: e.weight || 1,
            middle_seg: true,
            ix : ix
        });
        if (l_.pos === undefined) {
            l_.pos = net.helper_links.push(l_) - 1;
            l_.pos2 = net.helper_render_links.push(l_) - 1;
        }
        lr = lmr[ix] || (lmr[ix] = {
            g_ref: l,
            ref: e,
            id: "r" + ix,
            source: rv,
            target: vimg,
            real_source: u,
            real_target: v,
            size: 0,
            distance: e.weight || 1,
            right_seg: true,
            ix : ix
        });
        if (lr.pos === undefined) lr.pos = net.helper_links.push(lr) - 1;


        ++l.size;
        ++ll.size;
        ++l_.size;
        ++lr.size;

        // these are only useful for single-linked nodes, but we don't care; here we have everything we need at minimum cost.
        if (l.size == 1) {
            ++u.link_count;
            ++v.link_count;
            u.first_link = l;
            v.first_link = l;
            u.first_link_target = v;
            v.first_link_target = u;
        }
    };

    var del_edge = function (net, e) {
        var u, v,
            rui, rvi, ui, vi, lu, rv, uimg, vimg,
            i, ix,
            l, ll, l_, lr, j;

        // WHILE D3.LAYOUT.FORCE DOES CONVERT LINK.SOURCE AND LINK.TARGET NUMERIC VALUES TO DIRECT NODE REFERENCES,
        // IT DOESN'T FOR OTHER ATTRIBUTES, SUCH AS .REAL_SOURCE, SO WE DO NOT USE INDEXES IN NM[] BUT DIRECT NODE
        // REFERENCES TO SKIP THE D3.LAYOUT.FORCE IMPLICIT LINKS CONVERSION LATER ON AND ENSURE THAT BOTH .SOURCE/.TARGET
        // AND .REAL_SOURCE/.REAL_TARGET ARE OF THE SAME TYPE AND POINTING AT VALID NODES.
        rui = nodeid(e.real_source || e.source);
        rvi = nodeid(e.real_target || e.real_source || e.target);
        u = nm[rui];
        v = nm[rvi];
        if (u === v) {
            // SKIP NON-ORIGINAL LINKS FROM NODE TO SAME (A-A); THEY ARE RENDERED AS 0-LENGTH LINES ANYHOW. LESS LINKS IN ARRAY = FASTER ANIMATION.

            // SELF-REFERENTIAL 'LINKS' ARE PRODUCED AS 2 LINKS+1 HELPER NODE; THIS IS A GENERALIZED APPROACH SO WE
            // CAN SUPPORT MULTIPLE SELF-REFERENTIAL LINKS AS THANKS TO THE FORCE LAYOUT
            // THOSE HELPERS WILL ALL BE IN DIFFERENT PLACES, HENCE THE LINK 'PATH' FOR EACH
            // PARALLEL LINK WILL BE DIFFERENT.
            ix = e.ix;
            l = lm[ix];
            delete lm[ix];
            j = net.links.length;
            while(--j > l.pos) --net.links[j].pos;
            net.links.splice(l.pos, 1);
            // LINK(U,V) ==> U -> LU -> U


            lu = nmc[ix];
            delete nmc[ix];
            delete data.helpers.cyclic[ix];
            j = net.helper_nodes.length;
            while(--j > lu.pos){
                --net.helper_nodes[j].pos;
                --net.helper_nodes[j].index;
            }
            net.helper_nodes.splice(lu.pos, 1);

            l_ = lmc[ix];
            delete lmc[ix];
            j = net.helper_links.length;
            while(--j > l_.pos) --net.helper_links[j].pos;
            net.helper_links.splice(l_.pos, 1);
            j = net.helper_render_links.length;
            while(--j > l_.pos2) --net.helper_render_links[j].pos2;
            net.helper_render_links.splice(l_.pos2, 1);

            return;
        }
        // 'LINKS' ARE PRODUCED AS 3 LINKS+2 HELPER NODES; THIS IS A GENERALIZED APPROACH SO WE
        // CAN SUPPORT MULTIPLE LINKS BETWEEN ELEMENT NODES, ALWAYS, AS EACH
        // 'ORIGINAL LINK' GETS ITS OWN SET OF 2 HELPER NODES AND THANKS TO THE FORCE LAYOUT
        // THOSE HELPERS WILL ALL BE IN DIFFERENT PLACES, HENCE THE LINK 'PATH' FOR EACH
        // PARALLEL LINK WILL BE DIFFERENT.
        ui = nodeid(u);
        vi = nodeid(v);


        ix = e.ix;
        l = lm[ix];
        if(--l.size === 0) delete lm[ix];
        j = net.links.length;
        while(--j > l.pos) --net.links[j].pos;
        net.links.splice(l.pos, 1);

        // LINK(U,V) ==> U -> LU -> RV -> V
        lu = nml[ix];
        if(l.size === 0){
            delete nml[ix];
            delete data.helpers.left[ix];
        }
        j = net.helper_nodes.length;
        while(--j > lu.pos){
            --net.helper_nodes[j].pos;
            --net.helper_nodes[j].index;
        }
        net.helper_nodes.splice(lu.pos, 1);

        rv = nmr[ix];
        if(l.size === 0){
            delete nmr[ix];
            delete data.helpers.right[ix];
        }
        j = net.helper_nodes.length;
        while(--j > rv.pos){
            --net.helper_nodes[j].pos;
            --net.helper_nodes[j].index;
        }
        net.helper_nodes.splice(rv.pos, 1);

        uimg = nmimg[ui];
        vimg = nmimg[vi];
        ll = lml[ix];
        if(--ll.size === 0) delete lml[ix];
        j = net.helper_links.length;
        while(--j > ll.pos) --net.helper_links[j].pos;
        net.helper_links.splice(ll.pos, 1);

        l_ = lmm[ix];
        if(--l_.size === 0) delete lmm[ix];
        j = net.helper_links.length;
        while(--j > l_.pos) --net.helper_links[j].pos;
        net.helper_links.splice(l_.pos, 1);
        j = net.helper_render_links.length;
        while(--j > l_.pos2) --net.helper_render_links[j].pos2;
        net.helper_render_links.splice(l_.pos2, 1);


        lr = lmr[ix];
        if(--lr.size === 0) delete lmr[ix];
        j = net.helper_links.length;
        while(--j > lr.pos) --net.helper_links[j].pos;
        net.helper_links.splice(lr.pos, 1);


        // these are only useful for single-linked nodes, but we don't care; here we have everything we need at minimum cost.
        if (l.size === 0) {
            --u.link_count;
            --v.link_count;
            u.first_link = null;
            v.first_link = null;
            u.first_link_target = null;
            v.first_link_target = null;
        }
    };

    var add_vertex = function (net, n) {
        n.x = width / 2;
        n.y = height / 2;
        var img;

        // THE NODE SHOULD BE DIRECTLY VISIBLE
        nm[nodeid(n)] = n;
        img = {
            ref: n,
            x: n.x,
            y: n.y,
            size: 0,
            fixed: 1,
            id: nodeid(n)
        };
        nmimg[nodeid(n)] = img;
        n.pos = nodes.push(n) - 1;
        img.pos = net.helper_nodes.push(img) - 1;

        n.link_count = 0;
        n.first_link = null;
        n.first_link_target = null;
    };

    var del_vertex = function (net, n) {

        var img = nmimg[nodeid(n)], j;

        j = net.links.length;
        var list = [];
        while(j--){
            if(n === net.links[j].source || n === net.links[j].target)
                list.push(net.links[j]);
        }

        j = list.length;
        while(j--) del_edge(net, list[j]);

        delete nm[nodeid(n)];
        delete nmimg[nodeid(n)];

        j = nodes.length;
        while(--j > n.pos){
            --nodes[j].pos;
            --nodes[j].index;
        }
        nodes.splice(n.pos, 1);

        j = net.helper_nodes.length;
        while(--j > img.pos){
            --net.helper_nodes[j].pos;
            --net.helper_nodes[j].index;
        }
        net.helper_nodes.splice(img.pos, 1);

        n.first_link = null;
        n.first_link_target = null;
    };

    var network = function (data) {

        var links = [], // OUTPUT LINKS
            helper_links = [], // HELPER FORCE GRAPH LINKS
            helper_render_links = [], // HELPER FORCE GRAPH LINKS
            k;

        var net = {
            nodes: nodes,
            links: links,
            helper_nodes: helper_nodes,
            helper_links: helper_links,
            helper_render_links: helper_render_links,
            eadd : function(e){
                add_edge(net, e);
                net.force1.start();
                net.force2.start();
                net.update();
            },
            vadd : function(v){
                add_vertex(net, v);
                net.force1.start();
                net.force2.start();
                net.update();
            },
            edel : function(e){
                del_edge(net, e);
                net.force1.start();
                net.force2.start();
                net.update();
            },
            vdel : function(v){
                del_vertex(net, v);
                net.force1.start();
                net.force2.start();
                net.update();
            },
            uuid : uuid
        };


        // DETERMINE NODES
        for (k = 0; k < data.nodes.length; ++k) {
            add_vertex(net, data.nodes[k]);
        }

        // DETERMINE LINKS
        for (k = 0; k < data.links.length; ++k) {
            add_edge(net, data.links[k]);
        }


        return net;
    };

    // ==


    // SVG ELEMENTS TOOLS

    var vsvg = function(net){

        if (debug && debug < 3) {
            hnode = helper_nodeg
                .selectAll("circle.node")
                .data(
                    net.helper_nodes,
                    function (d) { return d.id; }
                );

            hnode.exit().remove();
            hnode_vsvg(hnode.enter());
        }


        var node = nodeg.selectAll("circle.node").data(net.nodes, function(d){
            return nodeid(d);
        });
        node.exit().remove();
        nodeg_vsvg(node.enter());
        return node;
    };


    var hnode_vsvg = function(enter){
        enter.append("circle")
            .attr("class", "node helper")
            .attr("r", function (d) { return 2; })
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .style("fill", function (_, i) { return fill(i); });
    };


    var nodeg_vsvg = function(enter){
        enter.append("circle")
            .attr("class", "node leaf")
            .attr("r", function (d) { return radius + 1; })
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .style("fill", function (_, i) { return fill(i); } );
    };

    var esvg = function(net){
        if (debug == 1) {
            link = linkg.selectAll("line.link").data(net.links, function(d){
                return linkid(d);
            });
            link.exit().remove();
            link.enter().append("line")
                .attr("class", "link")
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            link.style("stroke-width", option.stroke);
        }

        hlink = helper_linkg.selectAll("path.hlink").data(net.helper_render_links,
            function (d) { return d.id; }
        );
        hlink.exit().remove();
        hlink.enter().append("path").attr("class", "hlink");
        hlink.style("stroke-width", option.stroke);


        etext = edge_text.selectAll('text').data(net.helper_render_links,
            function (d) { return d.id; }
        );
        etext.exit().remove();
        etext.enter().append('text')
            .attr("text-anchor", "middle")
            .text(function(d) {return d.distance || '';});
    };


    // UPDATE DRAWING

    var update = function(net, force1, force2){
        // UPDATE SVG ELEMENTS
        esvg(net);
        var node = vsvg(net), power;

        node.call(force1.drag);

        var drag_in_progress = false;
        var change_squared = width * height;

        // CPU LOAD REDUX FOR THE FIX, PART 3: JUMPSTART THE ANNEALING PROCESS AGAIN WHEN THE USER MOVES THE MOUSE OUTSIDE THE NODE,
        // WHEN WE BELIEVE THE DRAG IS STILL GOING ON; EVEN WHEN IT ISN'T ANYMORE, BUT D3 DOESN'T INFORM US ABOUT THAT!
        node.on("mouseout.ger_fix", function (d) {

            if (debug == 1) console.log(
                "mouseout.ger_fix", this,
                arguments, d.fixed,
                drag_in_progress
            );

            if (drag_in_progress) force1.resume();
        });

        var resume_threshold = 0.05;

        force1.on("tick", function (e) {
            if (debug) {
                alpha_trace.push(alpha_scale(e.alpha));
                if (alpha_trace.length > width) alpha_trace.shift();
                path_trace_alpha.attr("d", alpha_line(alpha_trace));

                c2_trace.push(c2_scale(change_squared));
                if (c2_trace.length > width) c2_trace.shift();
                path_trace_c2.attr("d", c2_line(c2_trace));
            }

            /*
            Force all nodes with only one link to point outwards.
            To do this, we first calculate the center mass (okay, we wing it, we fake node 'weight'),
            then see whether the target node for links from single-link nodes is closer to the
            center-of-mass than us, and if it isn't, we push the node outwards.
            */
            var center = {
                    x: width / 2,
                    y: height / 2,
                    weight: 0
                },
                centroids = { x: 0, y: 0, weight: 0 },
                gc = centroids,
                size, c, k, mx, my, dx, dy, alpha;

            drag_in_progress = false;
            net.nodes.forEach(function (n) {
                var w = Math.max(1, n.size || 0, n.weight || 0);

                center.x += w * n.x;
                center.y += w * n.y;
                center.weight += w;

                gc.x += w * n.x;
                gc.y += w * n.y;
                gc.weight += w;

                if (n.fixed & 2) drag_in_progress = true;
            });

            size = force1.size();

            mx = size[0] / 2;
            my = size[1] / 2;

            gc.x /= gc.weight;
            gc.y /= gc.weight;


            // MOVE THE ENTIRE GRAPH SO THAT ITS CENTER OF MASS SITS AT THE CENTER, PERIOD.
            center.x /= center.weight || 1;
            center.y /= center.weight || 1;

            if (debug == 1) {
                center_of_mass
                    .attr("cx", center.x)
                    .attr("cy", center.y);
            }

            dx = mx - center.x;
            dy = my - center.y;

            alpha = e.alpha * 5;
            dx *= alpha;
            dy *= alpha;

            net.nodes.forEach(function (n) {
                n.x += dx;
                n.y += dy;
            });


            change_squared = 0;

            // FIXUP .PX/.PY SO DRAG BEHAVIOUR AND ANNEALING GET THE CORRECT VALUES, AS
            // FORCE.TICK() WOULD EXPECT .PX AND .PY TO BE THE .X AND .Y OF YESTERDAY.
            net.nodes.forEach(function (n) {
                // RESTRAIN ALL NODES TO WINDOW AREA
                var k, dx, dy,
                    /* styled border outer thickness and a bit */
                    r = (n.size > 0 ? n.size + radius : radius + 1) + 2;

                dx = 0;
                if (n.x < r) dx = r - n.x;
                else if (n.x > size[0] - r) dx = size[0] - r - n.x;

                dy = 0;
                if (n.y < r) dy = r - n.y;
                else if (n.y > size[1] - r) dy = size[1] - r - n.y;

                k = 1.2;

                n.x += dx * k;
                n.y += dy * k;
                // RESTRAINING COMPLETED.......................

                // FIXES 'ELUSIVE' NODE BEHAVIOUR WHEN HOVERING WITH THE MOUSE (RELATED TO FORCE.DRAG)
                if (n.fixed) {
                    // 'ELUSIVE BEHAVIOUR' ~ MOVE MOUSE NEAR NODE AND NODE WOULD TAKE OFF, I.E. ACT AS AN ELUSIVE CREATURE.
                    n.x = n.px;
                    n.y = n.py;
                }
                n.px = n.x;
                n.py = n.y;

                // PLUS COPY FOR FASTER STOP CHECK
                change_squared += (n.qx - n.x) * (n.qx - n.x);
                change_squared += (n.qy - n.y) * (n.qy - n.y);
                n.qx = n.x;
                n.qy = n.y;
            });

            // ALSO RESTRAIN HELPER NODES TO WITHIN THE VISIBLE AREA --> LINK PATHS ARE ALMOST ALWAYS KET IN-VIEW:
            net.helper_nodes.forEach(function (n) {
                // RESTRAIN ALL NODES TO WINDOW AREA
                var k, dx, dy,
                    r = (n.size > 0 ? n.size : 1) + 5 /* heuristic */ ;

                dx = 0;
                if (n.x < r)
                    dx = r - n.x;
                else if (n.x > size[0] - r)
                    dx = size[0] - r - n.x;

                dy = 0;
                if (n.y < r)
                    dy = r - n.y;
                else if (n.y > size[1] - r)
                    dy = size[1] - r - n.y;

                k = 1.2;

                n.x += dx * k;
                n.y += dy * k;
                // RESTRAINING COMPLETED.......................

                n.px = n.x;
                n.py = n.y;

                // PLUS COPY FOR FASTER STOP CHECK
                change_squared += (n.qx - n.x) * (n.qx - n.x);
                change_squared += (n.qy - n.y) * (n.qy - n.y);
                n.qx = n.x;
                n.qy = n.y;
            });

            if (!isFinite(change_squared))
                change_squared = width * height;

            // KICK THE FORCE2 TO ALSO DO A BIT OF ANNEALING ALONGSIDE:
            // TO MAKE IT DO SOMETHING, WE NEED TO SURROUND IT ALPHA-TWEAKING STUFF, THOUGH.
            force2.resume();
            force2.tick();
            force2.stop();

            // FAST STOP + THE DRAG FIX, PART 2:
            if (change_squared < option.fast_stop_threshold) {
                if (debug == 1) console.log("fast stop: CPU load redux");
                force1.stop();
                // FIX PART 4: MONITOR D3 RESETTING THE DRAG MARKER:
                if (drag_in_progress) {
                    if (debug == 1) console.log("START monitor drag in progress", drag_in_progress);
                    d3.timer(function () {
                        drag_in_progress = false;
                        net.nodes.forEach(function (n) {
                            if (n.fixed & 2) drag_in_progress = true;
                        });
                        force1.resume();
                        if (debug == 1) console.log("monitor drag in progress: drag ENDED", drag_in_progress);
                        // QUIT MONITORING AS SOON AS WE NOTICED THE DRAG ENDED.
                        // NOTE: WE CONTINUE TO MONITOR AT +500MS INTERVALS BEYOND THE LAST TICK
                        //       AS THIS TIMER FUNCTION ALWAYS KICKSTARTS THE FORCE LAYOUT AGAIN
                        //       THROUGH FORCE.RESUME().
                        //       D3.TIMER() API ONLY ACCEPTS AN INITIAL DELAY; WE CAN'T SET THIS
                        //       THING TO SCAN, SAY, EVERY 500MSECS UNTIL THE DRAG IS DONE,
                        //       SO WE DO IT THAT WAY, VIA THE REVIVED FORCE.TICK PROCESS.
                        return true;
                    }, 500);
                }
            } else if (change_squared > net.nodes
                    .length * 0.1 * resume_threshold &&
                e.alpha < resume_threshold) {
                // JOLT THE ALPHA (AND THE VISUAL) WHEN THERE'S STILL A LOT OF CHANGE WHEN WE HIT THE ALPHA THRESHOLD.
                force1.alpha(e.alpha *= 2); //FORCE.RESUME(), BUT NOW WITH DECREASING ALPHA STARTING VALUE SO THE JOLTS DON'T GET SO BIG.

                // AND 'DAMPEN OUT' THE TRIGGER POINT, SO IT BECOMES HARDER AND HARDER TO TRIGGER THE THRESHOLD.
                // THIS IS DONE TO COPE WITH THOSE INSTABLE (FOREVER ROTATING, ETC.) LAYOUTS...
                resume_threshold *= 0.75;
            }

            //--------------------------------------------------------------------


            if (debug == 1) {
                link.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });
            }

            node.attr("cx", function (d) {
                return d.x;
            })
                .attr("__name__", function (d) {
                    return d.name;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        });





        force2.on("tick", function (e) {
            /*
                Update all 'real'=fixed nodes.
                */
            net.helper_nodes.forEach(function (n) {
                var o;
                if (n.fixed) {
                    o = n.ref;
                    n.px = n.x = o.x;
                    n.py = n.y = o.y;
                }
            });
            net.helper_links.forEach(function (l) {
                var o = l.g_ref;
                l.distance = o.distance;
            });

            // NOTE: FORCE2 IS FULLY DRIVEN BY FORCE(1), BUT STILL THERE'S NEED FOR 'FAST STOP' HANDLING IN HERE
            //       AS OUR FORCE2 MAY BE MORE 'JOYOUS' IN ANIMATING THE LINKS THAT FORCE IS ANIMATING THE NODES
            //       THEMSELVES. HENCE WE ALSO TAKE THE DELTA MOVEMENT OF THE HELPER NODES INTO ACCOUNT!
            net.helper_nodes.forEach(function (n) {
                // SKIP THE 'FIXED' BUGGERS: THOSE ARE ALREADY ACCOUNTED FOR IN FORCE.TICK!
                if (n.fixed) return;

                // PLUS COPY FOR FASTER STOP CHECK
                change_squared += (n.qx - n.x) * (n.qx - n.x);
                change_squared += (n.qy - n.y) * (n.qy - n.y);
                n.qx = n.x;
                n.qy = n.y;
            });
            if (!isFinite(change_squared)) change_squared = width * height;

            //--------------------------------------------------------------------

            var logged = false;

            hlink.attr("d", function (d) {
                if (isFinite(d.real_source.x)) {
                    var linedata, dx, dy, f;
                    if (d.cyclic) {
                        // CONSTRUCT ROUND-ISH BEZIER FROM NODE TO HELPER AND BACK AGAIN:
                        dx = d.target.x - d.real_source.x;
                        dy = d.target.y - d.real_source.y;
                        linedata = [
                            [d.real_source.x, d.real_source.y],
                            [d.target.x - cycle_curvep * dy,
                                d.target.y + cycle_curvep * dx
                            ],
                            [d.target.x + cycle_curvep * dx,
                                d.target.y + cycle_curvep * dy
                            ],
                            [d.target.x + cycle_curvep * dy,
                                d.target.y - cycle_curvep * dx
                            ],
                            [d.real_source.x, d.real_source.y]
                        ];
                        return cycle_pathgen(linedata);
                    } else {
                        linedata = [
                            [d.real_source.x, d.real_source.y],
                            [d.source.x, d.source.y],
                            [d.target.x, d.target.y],
                            [d.real_target.x, d.real_target.y]
                        ];
                        return pathgen(linedata);
                    }
                } else {
                    if (!logged) {
                        console.log("boom");
                        logged = true;
                    }
                    return null;
                }
            });

            etext
                .attr("y", function(d) { return (d.source.y + d.target.y) / 2; })
                .attr("x", function(d) { return (d.source.x + d.target.x) / 2; });

            if (debug && debug < 3) {
                hnode.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            }
        });

        return net;
    };


    // INIT DRAWING EVENTS

    var init = function(){

        var net = network(data);

        var force1 = d3.layout.force()
            .nodes(net.nodes)
            .links(net.links)
            .size([width, height])
            .linkDistance(option.force1.distance)
            .gravity(option.force1.gravity)
            .charge(option.force1.charge)
            .friction(option.force1.friction) // FRICTION ADJUSTED TO GET DAMPENED DISPLAY: LESS BOUNCY BOUNCY BALL [SWEDISH CHEF, ANYONE?]
            .start();


        /**
         * AND HERE'S THE CRAZY IDEA FOR ALLOWING AND RENDERING MULTIPLE LINKS BETWEEN 2 NODES, ETC., AS THE INITIAL ATTEMPT
         * TO INCLUDE THE 'HELPER' NODES IN THE BASIC 'FORCE' FAILED DRAMATICALLY FROM A VISUAL POV: WE 'OVERLAY' THE BASIC
         * NODES+LINKS FORCE WITH A SECOND FORCE LAYOUT WHICH 'AUGMENTS' THE ORIGINAL FORCE LAYOUT BY HAVING IT 'LAYOUT' ALL
         * THE HELPER NODES (WITH THEIR LINKS) BETWEEN THE 'FIXED' REAL NODES, WHICH ARE LAID OUT BY THE ORIGINAL FORCE.
         *
         * THIS WAY, WE ALSO HAVE THE FREEDOM TO APPLY A COMPLETELY DIFFERENT FORCE FIELD SETUP TO THE HELPERS (NO GRAVITY
         * AS IT DOESN'T MAKE SENSE FOR HELPERS, DIFFERENT CHARGE VALUES, ETC.).
         */
        var force2 = d3.layout.force()
            .nodes(net.helper_nodes)
            .links(net.helper_links)
            .size([width, height])
            .linkDistance(option.force2.distance)
            .gravity(option.force2.gravity)
            .charge(option.force2.charge)
            .friction(option.force2.friction)
            .start()
            .stop(); // AND IMMEDIATELY STOP! FORCE.TICK WILL DRIVE THIS ONE EVERY TICK!

        net.force1 = force1;
        net.force2 = force2;
        net.update = function(){ update(net, force1, force2); };

        net.update();

        return net;

    };

    // ==



    // OK, DO IT

    var net = init();

    // ==


    // EVENT HANDLERS


    var setzoom = function(translate, scale){
        wrap.attr("transform",
            "translate(" + translate[0] + ',' + translate[1] +
            ")scale(" + scale + ")"
        );
    };


    var zoomed = function () {
        wrap.attr("transform",
            "translate(" + d3.event.translate +
            ")scale(" + d3.event.scale + ")"
        );
    };

    var zoom = d3.behavior.zoom()
        .scaleExtent(option.zoom_range)
        .on("zoom", zoomed);

    superwrap.call(zoom);
    superwrap.on('dblclick.zoom', null);

    vis.attr("opacity", 1e-6)
        .transition()
        .duration(1000)
        .attr("opacity", 1);

    net.option = option;
    net.zoom = setzoom;
    net.size = function(s){
        vis.attr("width", s[0]).attr("height", s[1]);
        if(s[0] > 0 || s[1] > 0) {
            superwrap.attr("width", s[0]).attr("height", s[1]);
            background.attr("width", s[0]).attr("height", s[1]);
            wrap.attr("width", s[0]).attr("height", s[1]);
        }
        net.force1.size(s);
        net.force2.size(s);
    };
    return net;

    // ==
};



// --------------------------------------------------------

var pulse = function(circle, option) {
    var action;

    var one = function(){
        return circle.transition()
            .duration(600)
            [option.type](option[option.type], option.range[1])
            .transition()
            .duration(600)
            [option.type](option[option.type],  option.range[0])
            .ease('sine');
    };

    var reset = function(){
        return circle.transition()
            .duration(600)
            [option.type](option[option.type],  option.range[0])
            .ease('sine');
    };

    var repeat = function() {

        return one().each("end", action);
    };

    var stop = function(){
        action = reset;
        return {start : start, stop : stop};
    };

    var start = function(){
        action = repeat;
        repeat();
        return {start : start, stop : stop};
    };

    return {start : start, stop : stop};
};

var rwedge = function(i, j){
    return {source:i, target:j, weight : 1 + Math.floor(Math.random() * 5)};
};


(function(){

    "use strict";

    var w = 940, h = 480;

    // var k = function(V){return Math.sqrt(V.length / (w * h));};

    var option = {
        debug : 1,
        root : 'div#root',
        width : w,
        height : h
    };

    var net = dynamic_multigraph(option);

    // var z = 6;

    // net.zoom([(1 - z) * w / 2, (1 - z) * h / 2], 7.36);

    var select = {vertex : null, edge : null};

    var pulsing;

    $('div#root').on('click', '> svg > g > g > g:nth-child(4) > path', function (e) {
        if(select.vertex) {
            pulsing.stop();
            select.vertex = null;
        }
        else if(select.edge) {
            select.edge[1].classed('selected', false);
            pulsing.stop();
        }

        var svg = d3.select(this);
        var edge = svg[0][0].__data__;
        console.log('edge click', edge);
        select.edge = [edge, svg];
        select.edge[1].classed('selected', true);
        pulsing = pulse(select.edge[1], {
            'style' : 'stroke-width',
            'range' : [option.stroke + 'px', 1.3 * option.stroke + 'px'],
            'type' : 'style'
        });
        pulsing.start();



        net.update();
        e.stopImmediatePropagation();
    });


    $('div#root').on('click', '> svg > g > g > g:nth-child(5) > circle', function (e) {

        if (select.edge){
            select.edge[1].classed('selected', false);
            pulsing.stop();
            select.edge = null;
        }

        var svg = d3.select(this);
        var vertex = svg[0][0].__data__;
        console.log('vertex click', vertex);
        if(select.vertex === null){
            select.vertex = [vertex, svg];
            pulsing = pulse(select.vertex[1], {
                'attr' : 'r',
                'range' : [net.option.radius + 1, net.option.radius + 4],
                'type' : 'attr'
            });
            pulsing.start();
        }
        else{
            console.log('2nd vertex click');
            net.eadd(rwedge(select.vertex[0], vertex));
            // pulsing.stop();
            // select.vertex = null;
        }


        e.stopImmediatePropagation();
    });

    $('html').keyup(function(e){
        if(e.keyCode === 46){ // DELETE
            if(select.vertex !== null){
                console.log('delete vertex', select.vertex);
                pulsing.stop();
                net.vdel(select.vertex[0]);
                select.vertex = null;
            }
            else if(select.edge !== null){
                console.log('delete edge', select.edge);
                select.edge[1].classed('selected', false);
                pulsing.stop();
                net.edel(select.edge[0]);
                select.edge = null;
            }
        }
        else if (e.keyCode === 27){ // ESCAPE
            if(select.vertex) {
                pulsing.stop();
                select.vertex = null;
            }
            else if (select.edge){
                select.edge[1].classed('selected', false);
                pulsing.stop();
                select.edge = null;
            }
        }
    });

    $('div#root').on('click', function (e) {
        console.log('frame click');
        if(e.ctrlKey){
            if(select.vertex) {
                pulsing.stop();
                select.vertex = null;
            }
            else if (select.edge){
                select.edge[1].classed('selected', false);
                pulsing.stop();
                select.edge = null;
            }
            else{
                net.vadd({ name : net.uuid() });
            }
            e.stopImmediatePropagation();
        }
    });


    var k = 1 + Math.floor(Math.random() * 4);
    var i = 0, j = 0;
    while(k--){
        var n = 1 + Math.floor(Math.random() * 7);
        var t = i;
        var len = i + n;
        for(; i < len; ++i) net.vadd({name : net.uuid()});
        for(i -= n; i < len; ++i){
            for(j = t; j < len; ++j){
                if(Math.random() < 0.3)
                    net.eadd(rwedge(net.nodes[j], net.nodes[i]));
            }
        }
    }




    window.net = net;


})();