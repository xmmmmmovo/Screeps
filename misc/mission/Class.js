const Class = {
    // 类型特性定义
    _Attribute: Config.Abstract | Config.Public,
    base: undefined,
    typeName: "Class",
    typeIndex: undefined,
    staticCtor: function(data) {
        Class.haveInitStatic = true; // TypeList 存在 Class 引用，必须屏蔽循环
        global.OOP = { // 提供空的多态代理
            base: undefined,
            typeIndex: 0,
            New: function() {
                throw Exception.New("InvalidOperatorException", "OOP don't have constructor, class have constructor.").value;
            },
            GetType: Class.GetInstanceType,
        };
        let TypeList = global.TypeList = {};
        let stringBuilder = "Class.staticCtor\n";
        for (let moduleName in data.TypeList) {
            const keyName = moduleName;
            let typeIndex = data.TypeList[moduleName];
            stringBuilder += "Class require moduleName: " + moduleName + ", ";
            const type = TypeList[typeIndex] = require("./" + moduleName);
            type.typeName = keyName;
            type.typeIndex = typeIndex;
            if (type._Attribute === undefined) {
                type._Attribute = 0;
            }
            if ((type._Attribute & Config.Public) !== 0) {
                global[type.typeName] = type;
                stringBuilder += " public ";
            } else {
                stringBuilder += " private ";
            }
            stringBuilder += type.typeName + (type.base ? " : " + type.base : "") + "\n";
        }
        console.log(stringBuilder);

        for (let typeIndex in TypeList) {
            const type = TypeList[typeIndex];
            Class.BaseClass(type, data);
            Class.InitType(type, data);

            for (const key in type) {
                const item = type[key];
                if (OOP[key] === undefined && typeof(item) === "function") {
                    const attributeName = key + "_Attribute";
                    OOP[key] = function(self, ...args) {
                        const type = TypeList[self.type];
                        if (!type) {
                            throw Exception.New("TypeException", "Invoke OOP, not found type : " + self.type + " method : " + key).value;
                        }
                        const attribute = type[attributeName];
                        if (attribute === undefined) {
                            throw Exception.New("ReferenceException", "Not found " + type.typeName + " method : " + key).value;
                        } else if ((attribute & Config.Public) === 0 || (attribute & Config.Abstract) !== 0) {
                            throw Exception.New("Exception", "Can't invoke private or abstract method from OOP. attribute : " + attribute +
                                " " + type.typeName + "." + key).value;
                        } else if ((attribute & Config.Static) !== 0) {
                            console.log("Don't invoke static function from instance! " + type.typeName + "." + key);
                        }
                        return type[key](self, ...args);
                    }
                }
            }
        }
    },
    // 查找目标类型名称的类型
    // string typeName: 类型的名称
    // return runtimeType | undefined
    GetType_Attribute: Config.Public | Config.Static,
    GetType: function(typeName) {
        for (const runtimeType of TypeList) {
            if (runtimeType.typeName === typeName) {
                return runtimeType;
            }
        }
        return undefined;
    },

    BaseClass_Attribute: Config.Private,
    BaseClass: function(runtimeType, data) {
        if ((runtimeType._Attribute & Config.Strcut) !== 0 && runtimeType.base !== undefined) {
            throw Exception.New("TypeException", "struct can't have base class").value;
        } else if (typeof(runtimeType.base) === "object") { // 基类已经创建过了
            console.log("baseClass, " + runtimeType.typeName + " have base type : " + runtimeType.base.typeName + ", return.");
            return;
        } else if (runtimeType.base === undefined) { // 无继承行为
            if (runtimeType.__init) {
                // 有参构造函数
                runtimeType.New = function(...args) {
                    var self = { type: runtimeType.typeIndex };
                    runtimeType.__init(self, ...args);
                    return self;
                };
            } else if ((runtimeType._Attribute & Config.Abstract) === 0) {
                // 非抽象函数，具有默认无参构造函数
                runtimeType.New = function(_) {
                    return { type: runtimeType.typeIndex };
                };
            } else {
                // 抽象且无构造函数，清除指向
                runtimeType.New = undefined;
            }
            return;
        }
        var baseType = TypeList[data.TypeList[runtimeType.base]];
        if (!baseType) {
            throw Exception.New("Exception", "Not found base class, typeName : " + runtimeType.typeName).value;
        } else if ((baseType._Attribute & Config.Strcut) !== 0) {
            throw Exception.New("TypeException", "Can't inheritance from struct, typeName : " + runtimeType.typeName).value;
        }
        // 基类先完成继承链
        Class.BaseClass(baseType);
        if ((runtimeType._Attribute & Config.Abstract) === 0) {
            // 创建构造函数
            runtimeType.New = function(...args) {
                var self = { type: runtimeType.typeIndex };
                var ctor = function(type) {
                    if (type.base) {
                        ctor(type.base);
                    }
                    if (type.__init) {
                        type.__init(self, ...args);
                    }
                };
                ctor(runtimeType);
                return self;
            };
        } else {
            runtimeType.New = undefined;
        }
        // 初始化前先静态实例化
        Class.InitType(baseType, data);
        // 继承
        runtimeType.base = baseType;
        // 继承公开方法
        // var stringBuilder = runtimeType.typeName + "\n";
        for (const key in baseType) {
            var value = baseType[key];
            // stringBuilder = stringBuilder + baseType.typeName + " get key : " + key + " " + typeof(runtimeType[key]) + " " +
            //     (typeof(value) + " " + !runtimeType[key] && typeof(value) === "function") + "\n";
            if (!runtimeType[key] && typeof(value) === "function") {
                const attribute = baseType[key + "_Attribute"];
                if ((attribute & Config.Public) !== 0) {
                    runtimeType[key] = baseType[key];
                    runtimeType[key + "_Attribute"] = attribute | Config.Inheritance;
                }
            }
        }
        // console.log(stringBuilder);
    },

    InitType_Attribute: Config.Private,
    InitType: function(type, data) {
        if (type.haveInitStatic) { // 已经实例化过
            return;
        }
        type.haveInitStatic = true;
        for (const key in type) {
            var value = type[key];
            if (typeof(value) === "function" &&
                type[key + "_Attribute"] === undefined) {
                type[key + "_Attribute"] = 0;
            }
        }
        if (type.staticCtor) {
            type.staticCtor(data);
        }
    },

    GetInstanceType_Attribute: Config.Public | Config.Static,
    GetInstanceType: function(instance) {
        const runtimeType = TypeList[instance.type];
        if (runtimeType === undefined) {
            throw Exception.New("TypeException", "Instance is not effective runtime instance. type : " + instance.type).value;
        }
        return runtimeType;
    },
    // 判断当前类型 self 是目标 type 指向类型的真子类型
    // ? type: 由反射获取到的运行时类型
    // return bool: 是否是子类型
    IsSubclassOf_Attribute: Config.Public,
    IsSubclassOf: function(self, type) {
        var select = self.base;
        if (type === undefined || TypeList[type.typeIndex] != type) {
            throw Exception.New("ArgumentException", "Type is not runtime type.").value;
        }
        while (select !== undefined) {
            if (select === type) {
                return true;
            }
        }
        return false;
    },
    // 判断当前类型 self 可转让自目标 type 指向类型
    // ? type: 由反射获取到的运行时类型
    // return bool: 可转让自目标
    IsAssignableFrom_Attribute: Config.Public,
    IsAssignableFrom: function(self, type) {
        var select = type;
        if (type === undefined || TypeList[type.typeIndex] != type) {
            throw Exception.New("ArgumentException", "Type is not runtime type.").value;
        }
        while (select !== undefined) {
            if (select === self) {
                return true;
            }
            select = select.base;
        }
        return false;
    }
}

module.exports = Class;