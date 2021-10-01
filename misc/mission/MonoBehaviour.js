var Behaviours = {};
var WillDestroyBehaviours = [];
Memory.Components = {};

const MonoBehaviour = {
    _Attribute: Config.Public,
    base: undefined,
    typeName: "MonoBehaviour",
    typeIndex: undefined,
    staticCtor: function(data) {},

    __init: function(self, data) {
        self.id = data.id; // 不能存储 obj, 否则很容易循环引用
        self.activeSelf = false; // 当前组件是否处于激活状态
        self.haveInit = false;
        self.alive = true; // 当前组件是否存活，如果为 false 即将被摧毁 此数据每帧缓存一次
        self.GUID = global.GUID++;
        let components;
        if (data.id) {
            const obj = Game.getObjectById(data.id);
            if (!obj) {
                console.log("Not found target, id error or it has been destroy.");
            } else {
                components = Memory.Components[data.id];
                if (components === undefined) {
                    Memory.Components[data.id] = [];
                }
            }
        } else if (data.virtual === true) { // 仅在内存有体现的无对象组件
            self.virtual = true;
        } else {
            throw Exception.New("ArgumentException", "MonoBehaivour muest be object.component or virtual. type : " + self.type).value;
        }
        Behaviours[self.GUID] = self;
        if (components) {
            components.push(self.GUID);
        }
    },

    Awake_Attribute: Config.Public,
    Awake: function(self) {

    },
    OnEnable_Attribute: Config.Public,
    OnEnable: function(self) {

    },
    OnDisable_Attribute: Config.Public,
    OnDisable: function(self) {

    },
    Update_Attribute: Config.Public,
    Update: function(self) {},
    LateUpdate_Attribute: Config.Public,
    LateUpdate: function(self) {},

    OnDestroy_Attribute: Config.Public,
    OnDestroy: function(self) {
        self.alive = false;
        const obj = Game.getObjectById(self.id);
        let components = obj ? Memory.Components[self.id] : undefined; // 摧毁组件之前，挂载对象可能已经摧毁或无效
        if (components) {
            const index = components.indexOf(self.GUID);
            components.splice(index, 1);
        }
    },

    // 访问当前组件是否存活
    // refresh 刷新实际状态而不使用缓存
    IsAlive_Attribute: Config.Public,
    IsAlive: function(self, refresh) {
        if (refresh === true) {
            let value;
            if (self.virtual) {
                value = self.alive;
            } else {
                const obj = Game.getObjectById(self.id);
                if (self.id && obj) {
                    const components = Memory.Components[self.id];
                    value = components && components.contains(self.GUID);
                } else {
                    value = false;
                }
            }
            self.alive = value ? true : false;
            return value;
        } else {
            return self.alive;
        }
    },
    SetActive_Attribute: Config.Public,
    SetActive: function(self, active) {
        active = active ? true : false;
        if (self.activeSelf == active) {
            return;
        } else if (active) {
            if (!self.haveInit) {
                self.haveInit = true;
                OOP.Awake(self);
            }
            OOP.OnEnable(self);
        } else {
            OOP.OnDisable(self);
        }
        self.activeSelf = active;
    },
    GetAllComponents_Attribute: Config.Public | Config.Static,
    GetAllComponents: function(id) {
        const componentsGUID = Game.getObjectById(id) ? Memory.Components[id] : undefined;
        if (!componentsGUID) {
            return [];
        }
        const components = new Array();
        for (let index = 0; index < componentsGUID.length; index++) {
            const GUID = componentsGUID[index];
            const component = Behaviours[GUID];
            if (component && component.alive) {
                components.push(component);
            }
        }
        return components;
    },
    // 从目标对象，查找一个组件
    GetComponent_Attribute: Config.Public | Config.Static,
    GetComponent: function(id, type) {
        if (!type || !type.typeIndex) {
            throw new Exception("ArgumentException", "type : " + type).value;
        }
        const components = Game.getObjectById(id) ? Memory.Components[id] : undefined;
        if (components === undefined) {
            return undefined;
        }
        for (let index = components.length - 1; index >= 0; index--) {
            const GUID = components[index];
            var behaivour = Behaviours[GUID];
            if (behaivour && behaivour.alive && behaivour.type == type.typeIndex) {
                return behaivour;
            }
        }
        return undefined;
    },
    // 向同一个对象，添加一个组件
    AddComponent_Attribute: Config.Public,
    AddComponent: function(self, type) {
        if (!Class.IsSubclassOf(type, MonoBehaviour)) {
            throw Exception.New("TypeException.", "AddComponent muest be MonoBehaivour class. type : " + self.type).value;
        }
        type.New({ id: self.id })
    },

    // static 更新所有的 MonoBehaivour 组件，包含 Update 和 LateUpdate
    RunBehaivours_Attribute: Config.Public | Config.Static,
    RunBehaivours: function() {
        const oldBehaivours = Behaviours;
        Behaviours = new Set();
        const destroyArray = WillDestroyBehaviours;
        for (const GUID in oldBehaivours) {
            const behaivour = oldBehaivours[GUID];
            if (MonoBehaviour.IsAlive(behaivour, true)) {
                Behaviours[GUID] = behaivour;
            } else { // 指向对象失效
                destroyArray.push(behaivour);
            }
        }
        var errorList = [];
        for (const GUID in Behaviours) {
            const behaivour = Behaviours[GUID];
            // try {
            if (behaivour.activeSelf && behaivour.alive) {
                OOP.Update(behaivour);
            }
            // } catch (error) {
            //     if (!error.message.startsWith("time: ")) {
            //         errorList.push(Exception.New(
            //             error.toString(),
            //             "behaivour id: " + behaivour.id + " GUID: " + behaivour.GUID + "\nerror:"));
            //     } else {
            //         errorList.push(error.toString());
            //     }
            // }
        }
        const destroyArrayLength = destroyArray.length;
        let selectBehaivour = undefined;
        for (let index = 0; index < destroyArrayLength; index++) {
            // try {
            const selectBehaivour = destroyArray.pop();
            OOP.OnDestroy(selectBehaivour);
            // } catch (error) {
            //     if (!error.message.startsWith("time: ")) {
            //         errorList.push(Exception.New(
            //             error.toString(),
            //             "behaivour id: " + selectBehaivour.id + " GUID: " + selectBehaivour.GUID + "\nerror:" + error.toString()));
            //     } else {
            //         errorList.push(error.toString());
            //     }
            // }
        }
        for (const GUID in Behaviours) {
            const behaivour = Behaviours[GUID];
            // try {
            if (behaivour.activeSelf && behaivour.alive) {
                OOP.LateUpdate(behaivour);
            }
            // } catch (error) {
            //     if (!error.message.startsWith("time: ")) {
            //         errorList.push(Exception.New(
            //             error.toString(),
            //             "behaivour id: " + behaivour.id + " GUID: " + behaivour.GUID + "\nerror:"));
            //     } else {
            //         errorList.push(error.toString());
            //     }
            // }
        }
        for (const exception of errorList) {
            console.log(exception.value.stack);
        }
    },
    GetById_Attribute: Config.Public | Config.Static,
    GetById: function(id) {
        var behaivour = Behaviours[id];
        if (behaivour && behaivour.alive) {
            return behaivour;
        } else {
            return undefined;
        }
    },
    GetByType_Attribute: Config.Public | Config.Static,
    GetByType: function(targetType) {
        var result = undefined;
        const typeIndex = targetType.typeIndex;
        for (const GUID in Behaviours) {
            const behaivour = Behaviours[GUID];
            if (behaivour.type === typeIndex) {
                result = behaivour;
                break;
            }
        }
        return result;
    },
    ToString: function() {
        console.log(JSON.stringify(Behaviours));
    },
};

module.exports = MonoBehaviour;