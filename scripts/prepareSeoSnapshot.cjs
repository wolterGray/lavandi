const {fetchSeoSnapshot, writeSnapshot} = require("./seoBuildData.cjs");

async function main() {
  const snapshot = await fetchSeoSnapshot();
  writeSnapshot(snapshot);
  console.log(
    `SEO snapshot: ${snapshot.services.length} services, ${snapshot.cosmetics.length} products from ${snapshot.source}`,
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
