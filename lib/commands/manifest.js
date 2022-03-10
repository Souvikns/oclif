"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const fs = require("fs-extra");
const path = require("path");
class Manifest extends core_1.Command {
    async run() {
        console.log('started command oclif manifest');
        try {
            fs.unlinkSync('oclif.manifest.json');
        }
        catch (_a) { }
        const { args } = await this.parse(Manifest);
        console.log('[ARGS]: ', args);
        const root = path.resolve(args.path);
        console.log('[ROOT]: ', root);
        let plugin = new core_1.Plugin({ root, type: 'core', ignoreManifest: true, errorOnManifestCreate: true });
        console.log('[PLUGIN]: ', JSON.stringify(plugin));
        if (!plugin)
            throw new Error('plugin not found');
        console.log('Loading plugin');
        await plugin.load();
        console.log('plugin loaded');
        if (!plugin.valid) {
            console.log('plugin is not valid, loading legacy plugin');
            const p = require.resolve('@oclif/plugin-legacy', { paths: [process.cwd()] });
            console.log('[LEGACY_PLUGIN_MODULE]: ', JSON.stringify(p));
            const { PluginLegacy } = require(p);
            plugin = new PluginLegacy(this.config, plugin);
            console.log('loading legacy plugin');
            await plugin.load();
            console.log('legacy plugin loaded');
            console.log('[LEGACY_PLUGIN]: ', JSON.stringify(plugin));
        }
        if (process.env.OCLIF_NEXT_VERSION) {
            plugin.manifest.version = process.env.OCLIF_NEXT_VERSION;
        }
        const dotfile = plugin.pjson.files.find((f) => f.endsWith('.oclif.manifest.json'));
        console.log('[DOTFILE]: ', dotfile);
        const file = path.join(plugin.root, `${dotfile ? '.' : ''}oclif.manifest.json`);
        console.log('[FILE]: ', file);
        fs.writeFileSync(file, JSON.stringify(plugin.manifest));
        this.log(`wrote manifest to ${file}`);
        console.log('end command oclif manifest');
    }
}
exports.default = Manifest;
Manifest.description = 'generates plugin manifest json';
Manifest.args = [
    { name: 'path', description: 'path to plugin', default: '.' },
];
