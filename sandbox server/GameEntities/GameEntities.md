# 实体系统 API 文档

本系统提供单个实体对象 `GameEntity` 的属性和方法，以及全局实体管理器 `entities`，用于创建、查询、销毁实体，并管理实体的生命周期事件。

---

## 一、GameEntity —— 单个实体

`GameEntity` 是游戏世界中所有动态对象的基类，包含外观、物理、交互、战斗等核心属性与行为。所有实体实例均可通过全局 `entities` 创建或获取。

### 属性

#### 基础信息

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `string`（只读） | 实体的唯一标识符，由引擎自动分配。 |
| `name` | `string` | 实体的显示名称（可自定义）。 |
| `tags` | `string[]` | 实体的标签列表，直接操作数组。 |

#### 外观与模型

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `model` | `string` | 模型资源的路径或标识，空字符串表示不显示模型。 |
| `position` | `GameVector3` | 实体在世界空间中的位置。 |
| `rotation` | `GameEuler` | 实体的旋转姿态（使用 GameEuler）。 |
| `scale` | `GameVector3` | 实体的缩放倍数。 |
| `color` | `GameRGBAColor` | 实体主色调（含透明度）。 |
| `visible` | `boolean` | 是否可见。 |
| `emissive` | `number` | 自发光强度（0~1）。 |
| `metalness` | `number` | 金属感（0~1）。 |
| `shininess` | `number` | 光滑度（0~1）。 |
| `modelOffset` | `GameVector3` | 模型相对于 `position` 的偏移量。 |

#### 物理属性

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `bounds` | `GameVector3` | 碰撞盒半边长（x, y, z）。 |
| `collides` | `boolean` | 是否参与碰撞。 |
| `fixed` | `boolean` | 是否固定不动（不受物理影响）。 |
| `friction` | `number` | 表面摩擦力（0~1）。 |
| `gravity` | `boolean` | 是否受重力影响。 |
| `mass` | `number` | 物理质量。 |
| `restitution` | `number` | 弹性系数（0~1）。 |
| `velocity` | `GameVector3` | 当前速度向量。 |
| `contactForce` | `GameVector3` | 当前帧受到的合力。 |
| `entityContacts` | `GameEntityContact[]`（只读） | 当前碰撞的实体列表。 |
| `voxelContacts` | `GameVoxelContact[]`（只读） | 当前碰撞的方块列表。 |
| `fluidContacts` | `GameFluidContact[]`（只读） | 当前接触的流体列表。 |

#### 交互属性

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `enableInteract` | `boolean` | 是否允许玩家互动。 |
| `interactRadius` | `number` | 可互动范围（单位：格）。 |
| `interactHint` | `string` | 可互动时显示的提示文本。 |
| `interactColor` | `GameRGBColor` | 提示文本的颜色。 |

#### 战斗属性

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `destroyed` | `boolean`（只读） | 实体是否已被销毁。 |
| `enableDamage` | `boolean` | 是否可被伤害（`true` 时 `hurt` 有效）。 |
| `showHealthBar` | `boolean` | 是否显示生命条。 |
| `hp` | `number` | 当前生命值。 |
| `maxHp` | `number` | 最大生命值。 |

### 方法

#### <font id="API" />lookAt(<font id="Type">targetPosition: GameVector3, upDirection?: GameVector3</font>)<font id="Type">: void</font>{#lookAt}

使实体朝向指定的世界坐标位置。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| targetPosition | 是 | GameVector3 | 目标位置。 |
| upDirection | 否 | GameVector3 | 上向量，默认为 Y 轴正方向。 |

---

#### <font id="API" />speak(<font id="Type">message: string, options?: Partial&lt;{ duration: number }&gt;</font>)<font id="Type">: void</font>{#speak}

让实体说话，显示气泡并触发 `entity_speak` 事件。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| message | 是 | string | 说话内容。 |
| options.duration | 否 | number | 气泡持续时间（毫秒），默认 2000。 |

---

#### <font id="API" />hurt(<font id="Type">amount: number, options?: Partial&lt;{ attacker: GameEntity, type: string, force: boolean }&gt;</font>)<font id="Type">: void</font>{#hurt}

对实体造成伤害，自动触发 `entity_damage` 事件，若 `hp` 降至 0 则触发 `entity_die` 并自动销毁。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| amount | 是 | number | 伤害值。 |
| options.attacker | 否 | GameEntity | 攻击者实体。 |
| options.type | 否 | string | 伤害类型。 |
| options.force | 否 | boolean | 若为 `true`，即使 `enableDamage` 为 `false` 也强制造成伤害。 |

---

#### <font id="API" />destroy()<font id="Type">: void</font>{#destroy}

销毁实体（若未销毁）。自动从全局管理器中移除，并触发 `entity_destroy` 事件。

---

#### <font id="API" />createAnimation()<font id="Type">: null</font>{#createAnimation}

**暂未实现**，返回 `null`。

---

#### <font id="API" />getAnimations()<font id="Type">: []</font>{#getAnimations}

**暂未实现**，返回空数组。

---

### 事件

`GameEntity` 自身不提供事件注册方法，所有实体相关事件均由全局 `entities` 在启动时注册为内部事件（编号 31xx）。沙盒脚本可通过 `events.on` 监听，并传入目标实体实例以精确锁定。

详细事件列表见下文“全局事件”章节。

---

## 二、entities —— 全局实体管理器

`entities` 是挂载在全局的对象，负责实体的生命周期管理、查询与配额控制。

### 属性

#### <font id="API" />count<font id="Type">: number</font>{#count}

当前活跃实体的总数（只读）。

---

### 方法

#### <font id="API" />create(<font id="Type">config: Partial&lt;GameEntityConfig&gt;</font>)<font id="Type">: GameEntity | null</font>{#create}

创建新实体，若达到配额上限则返回 `null`。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| config | 否 | Partial&lt;GameEntityConfig&gt; | 实体的初始属性配置，支持 `GameEntity` 的所有可写属性。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity \| null | 新实体或 null。 |

**示例**

<pre><code>const box = entities.create({
    model: 'temp/box.vox',
    position: new GameVector3(10, 5, 10),
    color: new GameRGBAColor(1, 0, 0, 1),
    collides: true,
    gravity: true
});
</code></pre>

---

#### <font id="API" />destroy(<font id="Type">entity: GameEntity</font>)<font id="Type">: boolean</font>{#destroy}

销毁指定实体，若实体已销毁则返回 `false`。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| entity | 是 | GameEntity | 要销毁的实体对象。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| boolean | 是否成功销毁。 |

---

#### <font id="API" />findAll()<font id="Type">: GameEntity[]</font>{#findAll}

返回所有活跃实体的列表。

---

#### <font id="API" />findById(<font id="Type">id: string</font>)<font id="Type">: GameEntity | null</font>{#findById}

根据实体 ID 查找单个实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| id | 是 | string | 实体 ID。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity \| null | 找到的实体，未找到则返回 null。 |

---

#### <font id="API" />findByTag(<font id="Type">tag: string</font>)<font id="Type">: GameEntity[]</font>{#findByTag}

返回所有包含指定标签的实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| tag | 是 | string | 标签名称。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 匹配实体列表。 |

---

#### <font id="API" />findByName(<font id="Type">name: string</font>)<font id="Type">: GameEntity[]</font>{#findByName}

返回所有名称匹配的实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| name | 是 | string | 实体名称。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 匹配实体列表。 |

---

#### <font id="API" />findByType(<font id="Type">type: 'player' | 'entity'</font>)<font id="Type">: GameEntity[]</font>{#findByType}

按类型筛选实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| type | 是 | 'player' \| 'entity' | `'player'` 返回所有玩家，`'entity'` 返回所有非玩家实体。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 匹配实体列表。 |

---

#### <font id="API" />query(<font id="Type">selector: string | object</font>)<font id="Type">: GameEntity[]</font>{#query}

通用查询方法，支持字符串选择器或对象过滤器。

**字符串选择器**：
- `'*'` —— 所有实体
- `'player'` —— 所有玩家
- `'#id'` —— 按 ID 查找（返回数组）
- `'.tag'` —— 按标签查找

**对象过滤器**：例如 `{ tag: 'box', name: 'npc' }`，支持键：
- `id` —— 精确匹配 ID
- `name` —— 精确匹配名称
- `tag` —— 包含指定标签
- `type` —— `'player'` 或 `'entity'`
- `tags` —— 数组，要求实体包含所有标签
- 其他属性（如 `collides: true`）直接比较

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| selector | 是 | string \| object | 查询条件。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 匹配实体列表。 |

**示例**

<pre><code>// 按 ID 查询
const player = entities.query('#player_1')[0];

// 按标签查询
const boxes = entities.query('.box');

// 复合条件
const redBoxes = entities.query({ tag: 'box', color: new GameRGBColor(1,0,0) });
</code></pre>

---

#### <font id="API" />findInBox(<font id="Type">bounds: GameBounds3</font>)<font id="Type">: GameEntity[]</font>{#findInBox}

返回位于指定轴对齐包围盒内的所有实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| bounds | 是 | GameBounds3 | 包围盒。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 包围盒内的实体列表。 |

---

#### <font id="API" />findInSphere(<font id="Type">center: GameVector3, radius: number</font>)<font id="Type">: GameEntity[]</font>{#findInSphere}

返回位于指定球体内的所有实体。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| center | 是 | GameVector3 | 球心坐标。 |
| radius | 是 | number | 球体半径（单位：格）。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity[] | 球体内的实体列表。 |

---

#### <font id="API" />findNearest(<font id="Type">position: GameVector3, filter?: Function</font>)<font id="Type">: GameEntity | null</font>{#findNearest}

返回距离指定位置最近的实体，可选过滤器函数。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| position | 是 | GameVector3 | 参考位置。 |
| filter | 否 | Function | 过滤函数，接收实体并返回布尔值。 |

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| GameEntity \| null | 最近的实体，若无则返回 null。 |

---

#### <font id="API" />getQuota()<font id="Type">: number</font>{#getQuota}

返回当前仍可创建的实体数量。

**返回值**

| **类型** | **说明** |
| -------- | -------- |
| number | 剩余可创建实体数。 |

---

#### <font id="API" />setMaxQuota(<font id="Type">quota: number</font>)<font id="Type">: void</font>{#setMaxQuota}

设置实体数量上限。

**输入参数**

| **参数** | **必填** | **类型** | **说明** |
| -------- | -------- | -------- | -------- |
| quota | 是 | number | 新的上限值（>=0）。 |

---

## 三、全局事件（内部号段 31xx）

以下事件由 `entities` 在引擎启动时自动注册为面向对象事件（目标类型 `GameEntity`）。沙盒脚本可通过全局 `events.on` 监听，并传入目标实体实例以精确锁定。

### 实体生命周期事件

| 事件名称 | 编号 | 触发时机 | 负载 | 目标对象 |
| :--- | :--- | :--- | :--- | :--- |
| `entity_create` | 3101 | 实体被创建时 | `{ entity: GameEntity, tick: number }` | 被创建的实体 |
| `entity_destroy` | 3102 | 实体被销毁时 | `{ entity: GameEntity, tick: number }` | 被销毁的实体 |

### 战斗事件

| 事件名称 | 编号 | 触发时机 | 负载 | 目标对象 |
| :--- | :--- | :--- | :--- | :--- |
| `entity_damage` | 3103 | 实体受到伤害时 | `{ entity, damage, attacker, type, tick }` | 受伤实体 |
| `entity_die` | 3104 | 实体死亡时 | `{ entity, attacker, type, tick }` | 死亡实体 |

### 交互与点击事件

| 事件名称 | 编号 | 触发时机 | 负载 | 目标对象 |
| :--- | :--- | :--- | :--- | :--- |
| `entity_click` | 3105 | 玩家点击实体时 | `{ entity, player, tick }` | 被点击实体 |
| `entity_interact` | 3106 | 玩家互动实体时 | `{ entity, player, tick }` | 被互动实体 |
| `entity_speak` | 3107 | 实体说话时 | `{ entity, message, options, tick }` | 说话实体 |

### 碰撞事件

| 事件名称 | 编号 | 触发时机 | 负载 | 目标对象 |
| :--- | :--- | :--- | :--- | :--- |
| `entity_contact_start` | 3108 | 开始接触其他实体时 | `{ entity, other, axis, force, tick }` | 当前实体 |
| `entity_contact_end` | 3109 | 结束接触其他实体时 | `{ entity, other, axis, force, tick }` | 当前实体 |
| `entity_voxel_contact` | 3110 | 开始接触方块时 | `{ entity, x, y, z, voxelId, axis, force, tick }` | 当前实体 |
| `entity_voxel_separate` | 3111 | 结束接触方块时 | `{ entity, x, y, z, voxelId, axis, force, tick }` | 当前实体 |
| `entity_fluid_enter` | 3112 | 进入流体时 | `{ entity, voxelId, tick }` | 当前实体 |
| `entity_fluid_leave` | 3113 | 离开流体时 | `{ entity, voxelId, tick }` | 当前实体 |

---

## 四、接口定义

### GameEntityConfig

用于 `entities.create` 的配置对象，支持 `GameEntity` 类的所有可写属性（如 `position`、`rotation`、`scale`、`model`、`color`、`collides` 等）。

### GameEntityContact

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| other | GameEntity | 接触的另一个实体 |
| force | GameVector3 | 接触力 |
| axis | GameVector3 | 接触轴 |

### GameVoxelContact

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| x, y, z | number | 方块坐标 |
| voxelId | number | 方块 ID |
| force | GameVector3 | 接触力 |
| axis | GameVector3 | 接触轴 |

### GameFluidContact

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| voxelId | number | 流体方块 ID |
| volume | number | 流体体积 |

---

## 五、使用示例

### 创建并操作实体

<pre><code>// 创建一个会说话的箱子
const box = entities.create({
    model: 'model/box.vb',
    position: new GameVector3(20, 8, 20),
    color: new GameRGBAColor(0.5, 0.2, 0.8, 1),
    enableInteract: true,
    interactHint: '点击我'
});

// 监听点击事件
events.on('entity_click', ({ entity, player }) => {
    entity.speak(`你好，${player.name}！`);
}, box);

// 5秒后销毁
setTimeout(() => {
    entities.destroy(box);
}, 5000);
</code></pre>

### 查询范围内的所有玩家

<pre><code>const center = new GameVector3(0, 0, 0);
const radius = 50;
const playersInRange = entities.findInSphere(center, radius)
    .filter(e => e.isPlayer);

playersInRange.forEach(p => {
    console.log(`${p.name} 在范围内`);
});
</code></pre>

### 使用通用查询

<pre><code>// 查找所有红色箱子
const redBoxes = entities.query({
    tag: 'box',
    color: new GameRGBColor(1, 0, 0)
});

// 查找 ID 为 'npc_1' 的实体
const npc = entities.query('#npc_1')[0];
</code></pre>
