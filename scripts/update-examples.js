#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get current version of Lerna packages
function getCurrentVersions() {
  try {
    // Check if Lerna is available
    const output = execSync("npx lerna list --json", {
      encoding: "utf8",
      stdio: "pipe",
    });
    const packages = JSON.parse(output);
    const versions = {};

    packages.forEach((pkg) => {
      versions[pkg.name] = pkg.version;
    });

    return versions;
  } catch (error) {
    // If Lerna is not available or no packages found, return empty object
    console.log(
      "ℹ️  Lerna not available or no packages found, skipping examples update"
    );
    return {};
  }
}

// Generate version range (^x.x.x format)
function generateVersionRange(version) {
  // Always use caret range for compatible updates
  return `^${version}`;
}

// Find all package.json files in examples
function findExamplePackageJsons() {
  const examplesDir = path.join(path.dirname(__dirname), "examples");
  const packageJsons = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file === "package.json") {
        packageJsons.push(filePath);
      }
    });
  }

  if (fs.existsSync(examplesDir)) {
    walkDir(examplesDir);
  }

  return packageJsons;
}

// Update dependencies in a package.json file
function updatePackageJson(filePath, versions) {
  const content = fs.readFileSync(filePath, "utf8");
  const packageJson = JSON.parse(content);
  let updated = false;

  // Update dependencies
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach((dep) => {
      if (versions[dep]) {
        const newVersion = generateVersionRange(versions[dep]);
        const currentVersion = packageJson.dependencies[dep];

        // Only update if current version is different from the new caret version
        if (currentVersion !== newVersion) {
          console.log(
            `📦 ${filePath}: ${dep} ${currentVersion} → ${newVersion}`
          );
          packageJson.dependencies[dep] = newVersion;
          updated = true;
        }
      }
    });
  }

  // Update devDependencies
  if (packageJson.devDependencies) {
    Object.keys(packageJson.devDependencies).forEach((dep) => {
      if (versions[dep]) {
        const newVersion = generateVersionRange(versions[dep]);
        const currentVersion = packageJson.devDependencies[dep];

        // Only update if current version is different from the new caret version
        if (currentVersion !== newVersion) {
          console.log(
            `📦 ${filePath}: ${dep} ${currentVersion} → ${newVersion}`
          );
          packageJson.devDependencies[dep] = newVersion;
          updated = true;
        }
      }
    });
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + "\n");
  }

  return updated;
}

// Main function
function main() {
  console.log("🔍 Getting current package versions...");
  const versions = getCurrentVersions();

  // If no versions found (first install or error), exit silently
  if (Object.keys(versions).length === 0) {
    return;
  }

  console.log("📋 Versions found (will use caret ranges):");
  Object.entries(versions).forEach(([name, version]) => {
    console.log(`  ${name}: ${version} → ${generateVersionRange(version)}`);
  });

  console.log("\n🔍 Looking for package.json files in examples...");
  const packageJsons = findExamplePackageJsons();

  if (packageJsons.length === 0) {
    console.log("❌ No package.json files found in examples");
    return;
  }

  console.log(`📦 Found ${packageJsons.length} package.json file(s)\n`);

  let totalUpdated = 0;
  packageJsons.forEach((filePath) => {
    const relativePath = path.relative(path.dirname(__dirname), filePath);
    const wasUpdated = updatePackageJson(filePath, versions);
    if (wasUpdated) {
      totalUpdated++;
    }
  });

  console.log(`\n✅ Updated ${totalUpdated} package.json file(s)`);

  if (totalUpdated > 0) {
    console.log("\n💡 Now you can run:");
    console.log("   npm install  # in the project root");
    console.log("   or");
    console.log("   lerna bootstrap  # to install all dependencies");
  }
}

main();
