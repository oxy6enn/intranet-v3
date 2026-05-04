type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const testCases: TestCase[] = [];

export function registerTest(name: string, run: TestCase["run"]) {
  testCases.push({ name, run });
}

export function getRegisteredTests() {
  return testCases;
}
