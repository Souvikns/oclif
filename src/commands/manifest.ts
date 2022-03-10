import {Command, Plugin} from '@oclif/core'
import * as fs from 'fs-extra'
import * as path from 'path'

export default class Manifest extends Command {
  static description = 'generates plugin manifest json'

  static args = [
    {name: 'path', description: 'path to plugin', default: '.'},
  ]

  async run(): Promise<void> {
    console.log('started command oclif manifest');
    try {
      fs.unlinkSync('oclif.manifest.json')
    } catch {}

    const {args} = await this.parse(Manifest)
    console.log('[ARGS]: ', JSON.stringify(args));
    const root = path.resolve(args.path)
    console.log('[ROOT]: ', root);
    let plugin = new Plugin({root, type: 'core', ignoreManifest: true, errorOnManifestCreate: true})
    console.log('[PLUGIN]: ', JSON.stringify(plugin));
    if (!plugin) throw new Error('plugin not found')
    console.log('Loading plugin');
    await plugin.load()
    console.log('plugin loaded');
    if (!plugin.valid) {
      console.log('plugin is not valid, loading legacy plugin');
      const p = require.resolve('@oclif/plugin-legacy', {paths: [process.cwd()]})
      console.log('[LEGACY_PLUGIN_MODULE]: ', JSON.stringify(p));
      const {PluginLegacy} = require(p)
      plugin = new PluginLegacy(this.config, plugin)
      console.log('loading legacy plugin');
      await plugin.load()
      console.log('legacy plugin loaded')
      console.log('[LEGACY_PLUGIN]: ', JSON.stringify(plugin));
    }

    if (process.env.OCLIF_NEXT_VERSION) {
      plugin.manifest.version = process.env.OCLIF_NEXT_VERSION
    }

    const dotfile = plugin.pjson.files.find((f: string) => f.endsWith('.oclif.manifest.json'))
    console.log('[DOTFILE]: ', dotfile);
    const file = path.join(plugin.root, `${dotfile ? '.' : ''}oclif.manifest.json`)
    console.log('[FILE]: ', file);
    fs.writeFileSync(file, JSON.stringify(plugin.manifest))
    this.log(`wrote manifest to ${file}`)
    console.log('end command oclif manifest');
  }
}
