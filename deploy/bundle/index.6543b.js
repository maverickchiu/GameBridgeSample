System.register("bundle://bundle/_virtual/bundle", ['./GameEntry.ts', './MainGameView.ts', './RotateComp.ts'], function () {
  return {
    setters: [null, null, null],
    execute: function () {}
  };
});

System.register("bundle://bundle/_virtual/GameEntry.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameEntryBase.ts', './MainGameView.ts'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Prefab, _decorator, instantiate, director, GameEntryBase, MainGameView;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Prefab = module.Prefab;
      _decorator = module._decorator;
      instantiate = module.instantiate;
      director = module.director;
    }, function (module) {
      GameEntryBase = module.GameEntryBase;
    }, function (module) {
      MainGameView = module.MainGameView;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
      cclegacy._RF.push({}, "4bf4abelZpPyJdHOD3c0BTb", "GameEntry", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let GameEntry = exports('GameEntry', (_dec = ccclass('GameEntry'), _dec2 = property(MainGameView), _dec3 = property(Prefab), _dec(_class = (_class2 = class GameEntry extends GameEntryBase {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "gameView", _descriptor, this);
          _initializerDefineProperty(this, "gameScenePrefab", _descriptor2, this);
          this._gameScene = null;
        }
        onSetup() {
          this.joinGame({
            theme: 1
          }).then(gameId => {
            this.gameView.setup(gameId);
            const gameScene = instantiate(this.gameScenePrefab);
            director.getScene().addChild(gameScene);
            this._gameScene = gameScene;
          });
        }
        onDestroy() {
          if (this._gameScene) {
            this._gameScene.destroy();
            this._gameScene = null;
          }
        }
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gameView", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "gameScenePrefab", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("bundle://bundle/_virtual/GameEntryBase.ts", ['cc'], function (exports) {
  var cclegacy, Component, _decorator;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Component = module.Component;
      _decorator = module._decorator;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "c10e0AvO7hPNrlcM/pdi+94", "GameEntryBase", undefined);
      const {
        ccclass
      } = _decorator;
      let GameEntryBase = exports('GameEntryBase', (_dec = ccclass('GameEntryBase'), _dec(_class = class GameEntryBase extends Component {
        constructor(...args) {
          super(...args);
          this._userInfo = void 0;
          this._impl = void 0;
        }
        onLoad() {
          console.log('GameEntryBase onLoad');
        }
        setup(userInfo, impl) {
          console.log('GameEntryBase setup', userInfo, impl);
          this._userInfo = userInfo;
          this._impl = impl;
          this.onSetup();
        }
        getUserInfo() {
          return this._userInfo;
        }
        joinGame(request) {
          if (!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
          }
          return this._impl.joinGame(request);
        }
        getRanks(rankType) {
          if (!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
          }
          return this._impl.getRanks(rankType);
        }
        findAccountInfo(nickname) {
          if (!this._impl) {
            return Promise.reject(new Error('GameBridge not setup'));
          }
          return this._impl.findAccountInfo(nickname);
        }
      }) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("bundle://bundle/_virtual/MainGameView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, Label, Button, _decorator, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      Label = module.Label;
      Button = module.Button;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "29855r3wedBtqUukQ5VgCPP", "MainGameView", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let MainGameView = exports('MainGameView', (_dec = ccclass('MainGameView'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(Button), _dec(_class = (_class2 = class MainGameView extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "label", _descriptor, this);
          _initializerDefineProperty(this, "labelResult", _descriptor2, this);
          _initializerDefineProperty(this, "buttonRoll", _descriptor3, this);
        }
        onLoad() {
          this.buttonRoll.node.on(Button.EventType.CLICK, this.onButtonRollClick, this);
        }
        onDestroy() {
          this.label.string = '尚未設置';
        }
        setup(gameId) {
          this.label.string = '已設置\nGame ID: ' + gameId;
        }
        onButtonRollClick() {
          const random = Math.floor(Math.random() * 6) + 1;
          this.labelResult.string = 'Rolling... ' + random;
        }
      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "labelResult", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "buttonRoll", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("bundle://bundle/_virtual/rollupPluginModLoBabelHelpers.js", [], function (exports) {
  return {
    execute: function () {
      exports({
        applyDecoratedDescriptor: _applyDecoratedDescriptor,
        initializerDefineProperty: _initializerDefineProperty
      });
      function _initializerDefineProperty(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
          enumerable: descriptor.enumerable,
          configurable: descriptor.configurable,
          writable: descriptor.writable,
          value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
      }
      function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object.keys(descriptor).forEach(function (key) {
          desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;
        if ('value' in desc || desc.initializer) {
          desc.writable = true;
        }
        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
          return decorator(target, property, desc) || desc;
        }, desc);
        if (context && desc.initializer !== void 0) {
          desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
          desc.initializer = undefined;
        }
        if (desc.initializer === void 0) {
          Object.defineProperty(target, property, desc);
          desc = null;
        }
        return desc;
      }
    }
  };
});

System.register("bundle://bundle/_virtual/RotateComp.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _initializerDefineProperty, cclegacy, _decorator, Component, Vec3;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _initializerDefineProperty = module.initializerDefineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
      Vec3 = module.Vec3;
    }],
    execute: function () {
      var _dec, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "ad23djSVEtDR4eGeIjuflO9", "RotateComp", undefined);
      const {
        ccclass,
        property
      } = _decorator;
      let RotateComp = exports('RotateComp', (_dec = ccclass('RotateComp'), _dec(_class = (_class2 = class RotateComp extends Component {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "speed", _descriptor, this);
        }
        update(dt) {
          this.node.eulerAngles = new Vec3(0, 0, this.node.eulerAngles.z + this.speed * dt);
        }
      }, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "speed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 180;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/bundle', 'bundle://bundle/_virtual/bundle'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});