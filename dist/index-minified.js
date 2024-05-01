"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KmpTools = void 0;
const O = require("node.extend"), j = require("js-yaml"), a = require("fs"), C = require("express-reverse"), l = require("path");
(b => { class v {
    getFolderPaths(e, t = "src", r = "Controller", o = []) { return a.readdirSync(e).forEach(n => { const s = l.join(e, n); if (a.statSync(s).isDirectory()) {
        const i = a.existsSync(l.join(s, r));
        i && o.push(l.relative(t, s) + "/"), i || this.getFolderPaths(s, t, r, o);
    } }), o; }
} b.Controller = v; class w {
    controllers = {};
    pathObjectTab = null;
    constructor(e, t) { t = O(!0, { routingFile: l.join(__dirname, "/../../app/config/routes.yml"), controllerPath: [l.join(__dirname, "/../../app/controllers")], helperName: "url" }, t || {}), C(e, { helperName: t.helperName }), this.initRoutes(e, t); }
    initRoutes = (e, t) => { t.controllerPath.forEach(r => { a.readdirSync(r).forEach(o => { const c = l.extname(o); if (o.indexOf(c) !== -1) {
        const n = o.substr(0, o.indexOf(".")), s = require(l.join(r, o));
        this.pathObjectTab = [];
        const i = this.depthOf(s, this.pathObjectTab).join(".");
        this.controllers[i + "." + n] = s;
    } }); }), this.parseYML(t.routingFile, e, null); };
    parseYML = (e, t, r) => { r = r || ""; let o = j.safeLoad(a.readFileSync(e, "utf8")); for (const c in o) {
        const n = o[c];
        if (n.resource) {
            this.parseYML(l.dirname(e) + "/" + n.resource, t, n.prefix);
            continue;
        }
        const s = n.controller.split(":"), i = s.slice(0, -1).join(".") + "Controller", g = s.slice(-1)[0] + "Action";
        if (!n.methods)
            throw new Error("No methods defined for controller " + n.controller);
        n.methods.forEach(d => { const y = i.split(".").reduce((u, h) => { if (u !== void 0)
            return u[h]; }, this.controllers[i]), f = t.get("container"); let p; if (f) {
            let u = /\.(\w+)Controller$/, h = i.replace(u, ".Controller.$1Controller");
            p = f.get(h)[g];
        }
        else
            p = new y()[g]; if (!p)
            throw new Error("No action found for " + n.controller); const x = d.toLowerCase(); t[x](c + "_" + d, r + n.pattern, p); });
    } };
    depthOf(e, t) { for (let r in e)
        e.hasOwnProperty(r) && typeof e[r] == "object" && (t.push(r), this.depthOf(e[r], t)); return t; }
} b.Routes = w; })(exports.KmpTools ||= {});
