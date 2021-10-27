'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  config: {
      "autosort": {
        "title": "Autosort Directories",
        "type": "array",
        "default": [],
        "items": {
          "type": "string"
        }
      },
      "lineMaxLen": {
        "title": "Maximum line width",
        "type": "integer",
        "default": 80,
        "minium": 1,
        "maximum": 1000
      },
      "noCompatibilityMode": {
        "title": "Disable compatibility mode (don't try to be compatible with old YAML versions)",
        "type": "boolean",
        "default": false,
      }
    },

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.workspace.observeTextEditors((function(_this){
      return function(editor){
        buffer = editor.getBuffer();
        if((editor.getGrammar()).name == "YAML"){
          buffer.onWillSave(function(){
            _this.validate_buffer(false)
            path = buffer.getPath();
            var config_paths = atom.config.get("yaml-sort.autosort");
            for(var i=0; i < config_paths.length; i++){
              if (path.indexOf(config_paths[i]) > -1){
                  _this.sort_keys();
              }
            }
          })
        }
      }
    })(this)));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'yaml-sort:sort-keys': () => this.sort_keys()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'yaml-sort:validate': () => this.validate_buffer(true)
    }));
  },

  destroy(){
    this.subscriptions.dispose();
  },

  validate_buffer(show_notification){
    editor = atom.workspace.getActiveTextEditor();
    yaml_parser = require('js-yaml')

    try {
      var doc = yaml_parser.load(editor.getText());
      if(show_notification){
        atom.notifications.addSuccess("YAML is valid.")
      }
    } catch (e) {
      atom.notifications.addError("YAML is invalid", {detail: e.message, dismissable: true})
      console.log(e);
    }
  },

  sort_keys() {
    yaml_parser = require('js-yaml')
    editor = atom.workspace.getActiveTextEditor();

    try {
      var doc = yaml_parser.load(editor.getText());
      editor.setText(yaml_parser.dump(doc, {
        sortKeys: true,
        lineWidth: atom.config.get('yaml-sort.lineMaxLen'),
        noCompatMode: atom.config.get('yaml-sort.noCompatibilityMode')
      }));
      atom.notifications.addSuccess("Keys resorted successfully")
    } catch (e) {
      atom.notifications.addError("Keys could not be resorted", {detail: e.message, dismissable: true})
      console.log(e);
    }
  },
};
