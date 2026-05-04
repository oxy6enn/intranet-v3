import { getRegisteredTests } from "./test-kit";
import "./permissions.test";
import "./route-access.test";
import "./temp-password.test";
import "./user-role.test";

async function main() {
  const testCases = getRegisteredTests();
  let passed = 0;

  for (const testCase of testCases) {
    try {
      await testCase.run();
      passed += 1;
      console.log(`PASS ${testCase.name}`);
    } catch (error) {
      console.error(`FAIL ${testCase.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log(`\n${passed}/${testCases.length} tests passed`);

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

main().catch((error) => {
  console.error("FAIL test runner");
  console.error(error);
  process.exit(1);
});
