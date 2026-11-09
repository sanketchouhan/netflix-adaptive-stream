const { bundleWorkflowCode } = require("@temporalio/worker");
const { writeFile } = require("fs/promises");
const path = require("path");

async function build() {
  const { code } = await bundleWorkflowCode({
    workflowsPath: path.join(__dirname, "../src/workflows"),
  });

  const codePath = path.join(__dirname, "../dist/workflow-bundle.js");
  await writeFile(codePath, code);
  console.log(`Workflow bundle written to ${codePath}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
