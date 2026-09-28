/**
 * 代码验证器
 * 根据关卡的测试用例验证用户代码的输出
 */

/**
 * 验证代码运行结果
 * @param {string} output - 程序的标准输出
 * @param {object} level - 关卡对象，包含 tests 数组
 * @returns {{ passed: boolean, message: string, hint?: string }}
 */
export function validateCode(output, level) {
  if (!level || !level.tests || level.tests.length === 0) {
    return {
      passed: true,
      message: "运行成功！",
    };
  }

  // 遍历所有测试用例，全部通过才算通过
  for (const test of level.tests) {
    const result = runTest(output, test);
    if (!result.passed) {
      return result;
    }
  }

  // 全部通过，返回最后一个测试的成功信息
  const lastTest = level.tests[level.tests.length - 1];
  return {
    passed: true,
    message: lastTest.successMessage || "所有测试通过！",
  };
}

/**
 * 运行单个测试
 */
function runTest(output, test) {
  switch (test.type) {
    case "stdout-contains":
      return testStdoutContains(output, test);
    case "stdout-matches":
      return testStdoutMatches(output, test);
    case "stdout-multi":
      return testStdoutMulti(output, test);
    case "stdout-exact":
      return testStdoutExact(output, test);
    default:
      return {
        passed: true,
        message: "运行成功",
      };
  }
}

// ========== 测试策略 ==========

/**
 * 输出包含指定字符串
 */
function testStdoutContains(output, test) {
  const passed = output.includes(test.expected);
  return {
    passed,
    message: passed
      ? test.successMessage || "测试通过"
      : test.failureMessage || `输出中没有找到 "${test.expected}"`,
    hint: passed ? undefined : test.hint,
  };
}

/**
 * 输出完全匹配（去除首尾空白后）
 */
function testStdoutExact(output, test) {
  const trimmed = output.trim();
  const expected = test.expected.trim();
  const passed = trimmed === expected;
  return {
    passed,
    message: passed
      ? test.successMessage || "输出完全匹配"
      : test.failureMessage || `期望输出 "${expected}"，实际输出 "${trimmed}"`,
    hint: passed ? undefined : test.hint,
  };
}

/**
 * 正则匹配
 */
function testStdoutMatches(output, test) {
  const regex = new RegExp(test.expected);
  const passed = regex.test(output);
  return {
    passed,
    message: passed
      ? test.successMessage || "匹配成功"
      : test.failureMessage || "输出不符合预期",
    hint: passed ? undefined : test.hint,
  };
}

/**
 * 多行输出，每行匹配一个期望值
 */
function testStdoutMulti(output, test) {
  const lines = output.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const expected = test.expected;

  if (lines.length < expected.length) {
    return {
      passed: false,
      message: test.failureMessage || `期望 ${expected.length} 行输出，实际只有 ${lines.length} 行`,
      hint: test.hint,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (!lines[i].includes(expected[i])) {
      return {
        passed: false,
        message: test.failureMessage || `第 ${i + 1} 行期望包含 "${expected[i]}"，实际是 "${lines[i]}"`,
        hint: test.hint,
      };
    }
  }

  return {
    passed: true,
    message: test.successMessage || "所有输出都正确",
  };
}
