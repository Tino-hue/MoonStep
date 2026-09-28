/**
 * 关卡数据与加载器
 * 配置驱动，后续可以从 JSON 文件加载
 */

import { isLevelUnlocked, isLevelCompleted } from "./progress.js";
import { openLevel } from "./main.js";

// 临时内联关卡数据，后续迁移到 levels/*.json
const levels = [
  {
    id: "01-variables",
    title: "第 1 关 · 变量与基础类型",
    description: `
      <h4>欢迎来到 MoonBit！</h4>
      <p>在这一关，你将学习 MoonBit 中最基础的变量声明和数据类型。</p>
      <h4>let 绑定</h4>
      <p>MoonBit 使用 <code>let</code> 关键字声明变量：</p>
      <pre><code>let x = 42</code></pre>
      <p>默认情况下，变量是不可变的。如果你需要可变变量，使用 <code>let mut</code>：</p>
      <pre><code>let mut count = 0
count = count + 1</code></pre>
      <h4>基础类型</h4>
      <p>MoonBit 有丰富的内置类型：</p>
      <p><code>Int</code> 整数、<code>Double</code> 浮点数、<code>Bool</code> 布尔值、<code>String</code> 字符串、<code>Char</code> 字符</p>
      <div class="tip-block">💡 MoonBit 有强大的类型推导能力，大部分时候你不需要手动写类型标注。</div>
      <h4>挑战</h4>
      <p>声明一个名为 <code>answer</code> 的变量，值为 <code>42</code>，然后打印它。</p>
    `,
    difficulty: 1,
    initialCode: `fn main {
  // 在这里声明一个名为 answer 的变量，值为 42
  // 然后用 println 打印它

}
`,
    hints: [
      "使用 let 关键字声明变量，例如：let x = 10",
      "println 函数可以打印值到控制台",
      "答案格式：let answer = 42; println(answer)",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "42",
        failureMessage: "输出中没有找到 42，检查一下你的变量值",
        successMessage: "太棒了！你已经学会了声明变量。",
      },
    ],
    prerequisites: [],
  },
  {
    id: "02-functions",
    title: "第 2 关 · 函数",
    description: `
      <h4>函数基础</h4>
      <p>在 MoonBit 中，使用 <code>fn</code> 关键字定义函数：</p>
      <pre><code>fn add(a: Int, b: Int) -> Int {
  a + b
}</code></pre>
      <p>函数的最后一个表达式就是返回值，不需要写 <code>return</code>。</p>
      <h4>挑战</h4>
      <p>定义一个函数 <code>double</code>，接收一个整数参数，返回它的两倍。然后在 <code>main</code> 中调用并打印结果。</p>
    `,
    difficulty: 1,
    initialCode: `fn main {
  // 调用你的 double 函数并打印结果
  println(double(21))
}

// 在这里定义 double 函数

`,
    hints: [
      "函数定义格式：fn 函数名(参数: 类型) -> 返回类型 { ... }",
      "double 函数接收一个 Int，返回 Int",
      "fn double(n: Int) -> Int { n * 2 }",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "42",
        failureMessage: "double(21) 应该等于 42",
        successMessage: "干得漂亮！你已经掌握了函数定义。",
      },
    ],
    prerequisites: ["01-variables"],
  },
  {
    id: "03-pattern-matching",
    title: "第 3 关 · 模式匹配",
    description: `
      <h4>match 表达式</h4>
      <p>MoonBit 的模式匹配是一个强大的特性，使用 <code>match</code> 关键字：</p>
      <pre><code>fn describe(x: Int) -> String {
  match x {
    0 => "零"
    1 => "一"
    _ => "其他"
  }
}</code></pre>
      <h4>枚举与模式匹配</h4>
      <p>模式匹配配合 <code>enum</code> 使用效果更佳：</p>
      <pre><code>enum Color {
  Red
  Green
  Blue
}

fn colorName(c: Color) -> String {
  match c {
    Red => "红"
    Green => "绿"
    Blue => "蓝"
  }
}</code></pre>
      <h4>挑战</h4>
      <p>定义一个 <code>fib</code> 函数，使用模式匹配计算斐波那契数列的第 n 项。</p>
    `,
    difficulty: 2,
    initialCode: `fn main {
  println(fib(10))
}

// 在这里定义 fib 函数
// 提示：fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)

`,
    hints: [
      "使用 match 表达式处理 n = 0 和 n = 1 的情况",
      "递归调用 fib(n-1) + fib(n-2)",
      "fn fib(n: Int) -> Int { match n { 0 => 0 ... } }",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "55",
        failureMessage: "fib(10) 应该等于 55",
        successMessage: "完美！模式匹配是函数式编程的精髓。",
      },
    ],
    prerequisites: ["02-functions"],
  },
  {
    id: "04-structs",
    title: "第 4 关 · 结构体",
    description: `
      <h4>结构体</h4>
      <p>使用结构体组织相关数据：</p>
      <pre><code>struct Point {
  x: Int
  y: Int
}

fn main {
  let p = { x: 10, y: 20 }
  println(p.x)
}</code></pre>
      <h4>挑战</h4>
      <p>定义一个 <code>Person</code> 结构体，包含 <code>name</code> 和 <code>age</code> 字段。创建一个实例并打印。</p>
    `,
    difficulty: 2,
    initialCode: `// 在这里定义 Person 结构体


fn main {
  // 创建一个 Person 实例并打印名字
  let p = { name: "MoonBit", age: 1 }
  println(p.name)
}
`,
    hints: [
      "struct Person { name: String, age: Int }",
      "结构体定义写在 main 函数外面",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "MoonBit",
        failureMessage: "应该输出 MoonBit",
        successMessage: "很好！结构体是组织数据的基础。",
      },
    ],
    prerequisites: ["03-pattern-matching"],
  },
  {
    id: "05-traits",
    title: "第 5 关 · Trait 特征系统",
    description: `
      <h4>什么是 Trait？</h4>
      <p>Trait 定义了一组行为接口，类似于其他语言的 interface。</p>
      <pre><code>trait Show {
  fn to_string(Self) -> String
}

impl Show for Int with fn to_string(self) -> String {
  self.to_string()
}</code></pre>
      <h4>挑战</h4>
      <p>定义一个 <code>Greet</code> trait，并为 <code>String</code> 实现它。</p>
    `,
    difficulty: 3,
    initialCode: `// 在这里定义 Greet trait 和实现


fn main {
  println("World".greet())
}
`,
    hints: [
      "trait Greet { fn greet(Self) -> String }",
      "impl Greet for String with fn greet(self) -> String { ... }",
      '返回 "Hello, " + self + "!"',
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "Hello, World!",
        failureMessage: "应该输出 Hello, World!",
        successMessage: "出色！Trait 是 MoonBit 抽象的核心工具。",
      },
    ],
    prerequisites: ["04-structs"],
  },
  {
    id: "06-generics",
    title: "第 6 关 · 泛型",
    description: `
      <h4>泛型函数</h4>
      <p>MoonBit 支持泛型，让你写出更通用的代码：</p>
      <pre><code>fn identity[T](x: T) -> T {
  x
}</code></pre>
      <h4>挑战</h4>
      <p>实现一个泛型函数 <code>swap</code>，接收一个二元组，返回交换后的二元组。</p>
    `,
    difficulty: 3,
    initialCode: `// 在这里实现 swap 泛型函数


fn main {
  let (a, b) = swap((1, "hello"))
  println(a)
  println(b)
}
`,
    hints: [
      "函数名后用 [A, B] 声明泛型参数",
      "返回类型是 (B, A)",
      "fn swap[A, B](pair: (A, B)) -> (B, A) { let (a, b) = pair; (b, a) }",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "hello",
        failureMessage: "第一个输出应该是 hello",
        successMessage: "完美！泛型让代码更具通用性。",
      },
    ],
    prerequisites: ["05-traits"],
  },
  {
    id: "07-error-handling",
    title: "第 7 关 · 错误处理",
    description: `
      <h4>try / catch 语法</h4>
      <p>MoonBit 使用 <code>try</code> / <code>catch</code> 进行错误处理：</p>
      <pre><code>fn divide(a: Int, b: Int) -> Int! {
  if b == 0 {
    raise("division by zero")
  }
  a / b
}</code></pre>
      <h4>挑战</h4>
      <p>使用 <code>try</code> / <code>catch</code> 安全地解析一个字符串为整数，失败时返回 0。</p>
    `,
    difficulty: 3,
    initialCode: `fn main {
  let result = safe_parse_int("42")
  println(result)
  let result2 = safe_parse_int("abc")
  println(result2)
}

// 在这里实现 safe_parse_int 函数
// 提示：使用 @int.parse 或 @strconv.parse_int

`,
    hints: [
      "尝试用 try 包裹解析，用 catch 处理错误",
      "函数返回类型是 Int（没有 !，因为内部处理了错误）",
      "try @strconv.parse_int(s) catch { _ => 0 }",
    ],
    tests: [
      {
        type: "stdout-contains",
        expected: "42",
        failureMessage: "解析 '42' 应该得到 42",
        successMessage: "漂亮！错误处理让程序更健壮。",
      },
    ],
    prerequisites: ["06-generics"],
  },
  {
    id: "08-project",
    title: "第 8 关 · 综合项目：猜数字",
    description: `
      <h4>综合挑战</h4>
      <p>现在，把你学到的知识都用起来！实现一个简单的猜数字游戏逻辑：</p>
      <ul>
        <li>生成一个 1-100 的随机数（这里我们固定为 42 以便测试）</li>
        <li>定义一个函数，接收猜测值，返回判断结果</li>
        <li>如果猜对了返回 0，猜小了返回 -1，猜大了返回 1</li>
      </ul>
      <h4>挑战</h4>
      <p>实现 <code>guess</code> 函数，并用多种测试用例验证它。</p>
    `,
    difficulty: 4,
    initialCode: `let secret = 42

fn guess(n: Int) -> Int {
  // 在这里实现：n < secret 返回 -1，n > secret 返回 1，相等返回 0
  0
}

fn main {
  println(guess(30))  // 应该输出 -1
  println(guess(50))  // 应该输出 1
  println(guess(42))  // 应该输出 0
}
`,
    hints: [
      "使用 if / else if / else 判断三种情况",
      "或者使用 match 表达式",
      "if n < secret { -1 } else if n > secret { 1 } else { 0 }",
    ],
    tests: [
      {
        type: "stdout-multi",
        expected: ["-1", "1", "0"],
        failureMessage: "三次猜测的结果不正确",
        successMessage: "🎉 恭喜！你已经掌握了 MoonBit 基础！",
      },
    ],
    prerequisites: ["07-error-handling"],
  },
];

// 当前加载的关卡
let currentLevel = null;

// ========== 关卡地图渲染 ==========
export function initLevelMap() {
  const container = document.getElementById("level-map");
  if (!container) return;

  container.innerHTML = levels
    .map((level) => {
      const unlocked = isLevelUnlocked(level.id, levels);
      const completed = isLevelCompleted(level.id);
      const statusClass = completed ? "completed" : unlocked ? "" : "locked";
      const icon = completed ? "✓" : unlocked ? level.id.slice(0, 2) : "🔒";

      return `
        <div class="level-node ${statusClass}" data-level-id="${level.id}">
          <div class="level-node-circle">${icon}</div>
          <div class="level-node-content">
            <div class="level-node-title">${level.title}</div>
            <div class="level-node-desc">${getLevelDescription(level)}</div>
          </div>
        </div>
      `;
    })
    .join("");

  // 绑定点击事件
  container.querySelectorAll(".level-node:not(.locked)").forEach((node) => {
    node.addEventListener("click", () => {
      const levelId = node.dataset.levelId;
      openLevel(levelId);
    });
  });
}

// 关卡简短描述
function getLevelDescription(level) {
  const descriptions = {
    "01-variables": "学习变量声明和基础数据类型",
    "02-functions": "定义函数，封装可复用的逻辑",
    "03-pattern-matching": "使用模式匹配处理多种情况",
    "04-structs": "用结构体组织复合数据",
    "05-traits": "通过 trait 定义行为接口",
    "06-generics": "编写通用的泛型代码",
    "07-error-handling": "优雅地处理错误情况",
    "08-project": "综合运用所学知识，完成一个小项目",
  };
  return descriptions[level.id] || "";
}

// ========== 加载单个关卡 ==========
export function loadLevel(levelId) {
  const level = levels.find((l) => l.id === levelId);
  if (level) {
    currentLevel = level;
    return level;
  }
  return null;
}

// ========== 获取当前关卡 ==========
export function getCurrentLevel() {
  return currentLevel;
}

// ========== 获取下一关 ID ==========
export function getNextLevelId() {
  if (!currentLevel) return null;
  const currentIndex = levels.findIndex((l) => l.id === currentLevel.id);
  if (currentIndex >= 0 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1].id;
  }
  return null;
}

// ========== 获取所有关卡 ==========
export function getAllLevels() {
  return levels;
}

// ========== 获取关卡总数 ==========
export function getTotalLevels() {
  return levels.length;
}
