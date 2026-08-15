# 事件系统 API 文档

本事件系统提供统一的事件注册、监听、触发与管理机制，支持全局事件和面向对象事件（仅内部号段）。所有 API 通过全局对象 `events` 访问。

---

## 一、事件对象 GameEvent

每个事件是 GameEvent 类的实例，沙盒开发者不能直接构造，只能通过 events.register 注册自定义事件获得实例。

只读属性：
- name：字符串，事件名称
- code：数字，事件编号
- description：字符串，事件描述（注册时可指定）

---

## 二、事件管理器 events

### 1. 注册事件

语法：
    events.register(name, codeOrOptions, options)

参数：
- name：字符串，事件名称（全局唯一，重复注册会直接报错并失败）
- codeOrOptions：若为数字，则指定事件编号（必须 >= 10000）；若为对象，则为配置项。
- options：配置对象（当第二个参数为编号时使用）。

配置项字段：
- description：字符串，事件描述（可选）
- trigger：函数，返回布尔值，用于自动轮询判断是否触发（可选，仅全局事件有效）

返回值：GameEvent 实例

错误：
- 若名称已被占用，抛出错误。
- 若编号已被占用，抛出错误。
- 若指定编号小于 10000，抛出错误。

示例：
    const myEvent = events.register('myCustomEvent', {
        description: '玩家到达终点时触发',
        trigger: () => {
            return world.someFlag === true;
        }
    });

### 2. 注销事件

语法：
    events.unregister(nameOrCode, secret)

参数：
- nameOrCode：事件名称或编号
- secret：密钥（仅内部业务事件需要，沙盒代码无法调用此参数注销业务事件）

返回值：布尔值，是否成功注销

### 3. 检查事件是否存在

语法：
    events.has(nameOrCode)

参数：
- nameOrCode：事件名称或编号

返回值：布尔值

### 4. 监听事件

语法：
    events.on(nameOrCode, callback, target)

参数：
- nameOrCode：事件名称或编号
- callback：函数，接收一个参数 data（事件负载）
- target：可选，目标对象（用于绑定到特定实体/方块等实例）

返回值：监听令牌（见下文）

示例：
    events.on('tick', (data) => {
        console.log('每一帧触发');
    });

    events.on('entityHurt', ({ damage, tick }) => {
        console.log('目标实体受伤，伤害：' + damage);
    }, myEntity);

### 5. 异步等待下一次事件

语法：
    events.next(nameOrCode, target, timeout)

参数：
- nameOrCode：事件名称或编号
- target：可选，目标对象
- timeout：毫秒数，超时时间（0 表示不超时）

返回值：Promise，解析为事件负载；超时返回 null

示例：
    const data = await events.next('entityHurt', myEntity, 5000);
    if (data) {
        console.log('伤害：' + data.damage);
    } else {
        console.log('等待超时');
    }

### 6. 手动触发事件

语法：
    events.trigger(nameOrCode, data, target, secret)

参数：
- nameOrCode：事件名称或编号
- data：事件负载，任意类型
- target：可选，目标对象（对象事件必须提供）
- secret：密钥（沙盒代码无法触发业务事件）

返回值：布尔值，是否成功触发

示例：
    events.trigger('myCustomEvent', { score: 100 });

### 7. 移除目标对象上的所有监听器

语法：
    events.offTarget(target)

参数：
- target：目标对象（实体/方块等）

作用：当对象被销毁时，引擎自动调用此方法清理绑定在该对象上的所有监听器，避免内存泄漏。

### 8. 轮询检查触发条件

语法：
    events.poll()

作用：遍历所有全局事件，调用其 trigger 函数，若返回 true 则自动触发该事件。
此方法由引擎每帧自动调用，沙盒开发者无需手动执行。

---

## 三、监听令牌（token）

events.on 方法返回一个监听令牌对象，包含以下三个方法：

- cancel()：取消该监听器。
- resume()：恢复已取消的监听器。
- active()：返回布尔值，表示监听器当前是否活跃。

示例：
    const token = events.on('tick', (data) => {
        console.log('tick');
    });
    token.cancel();          // 取消监听
    token.resume();          // 恢复监听
    console.log(token.active()); // false 或 true

---

## 四、全局事件与对象事件

- 全局事件（如 tick, playerJoin）：监听时不传 target，触发时无需 target。
- 对象事件（如 entityHurt, voxelChanged）：监听时可传入 target 锁定特定实例，触发时必须传入对应的 target 实例。
- 对象事件仅限内部号段注册，沙盒代码不能注册对象事件，但可以自由监听任意对象事件（传入 target 时锁定实例，不传时监听所有实例）。

---

## 五、错误处理注意事项

- 注册时，若事件名称重复或编号重复，将直接抛出异常，注册失败。
- 触发不存在的业务事件或自定义事件时，返回 false 而非抛出异常。
- 监听不存在的事件时，会抛出异常。
- 在 trigger 或 next 中传入错误的 target 类型，可能会导致事件无法匹配，但不会抛出异常。