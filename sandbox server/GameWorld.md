# 游戏世界 API 文档

`world` 是沙盒世界的全局入口对象，提供地图基础信息和 tick 事件驱动。

---

## 只读属性

所有属性均为只读，通过 `world.属性名` 直接访问。

- `world.tick` : 世界当前的帧计数（每 64ms 增加 1）。
- `world.name` : 地图名称，来自 `temp/inf.json` 的 `name` 字段。
- `world.id`   : 地图唯一标识符。
- `world.version` : 地图版本号。
- `world.author` : 地图作者。
- `world.description` : 地图描述。

---

## 事件

`world` 本身不提供事件注册方法，所有事件通过全局 `events` 对象监听。

### 监听 tick 事件

每 64ms 触发一次，使用 `events.on('tick', callback)` 监听。

回调参数：
    { tick: number }   // 当前的 tick 计数

示例：
    events.on('tick', (data) => {
        console.log('当前 tick:', data.tick);
    });

---

## 完整示例

    // 获取地图信息
    console.log('地图名称:', world.name);
    console.log('地图 ID:', world.id);
    console.log('当前 tick:', world.tick);

    // 监听每帧 tick
    events.on('tick', ({ tick }) => {
        // 每帧执行一次
        console.log('第', tick, '帧');
    });