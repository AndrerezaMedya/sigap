import { getBmkgWeather } from "./src/lib/bmkg";
import { getFloodAlerts } from "./src/lib/flood";
import { getMicroclimate } from "./src/lib/visualcrossing";
import { buildEnvironmentalContext } from "./src/lib/context";
import { generateGeminiRecommendation } from "./src/lib/gemini";



async function runTests() {
  console.log("=== STARTING API TESTS ===\n");

  const lat = -6.162;
  const lng = 106.848;
  const adm4Code = "31.71.03.1001"; // Kemayoran
  const locationName = "Jakarta Pusat - Kemayoran";

  try {
    console.log("1. Testing BMKG API...");
    const bmkg = await getBmkgWeather(adm4Code, locationName);
    console.log("✅ BMKG Success:");
    console.log(`   Summary: ${bmkg.summary}`);
    console.log(`   Location: ${bmkg.locationLabel}`);
    
    console.log("\n2. Testing PetaBencana API...");
    const flood = await getFloodAlerts(lat, lng, locationName);
    console.log("✅ PetaBencana Success:");
    console.log(`   Summary: ${flood.summary}`);

    console.log("\n3. Testing VisualCrossing API...");
    const vc = await getMicroclimate(lat, lng, locationName);
    console.log("✅ VisualCrossing Success:");
    console.log(`   Summary: ${vc.summary}`);

    console.log("\n4. Testing Gemini Recommendation Engine...");
    // Mock user context
    const userContext = {
      locationName,
      lat,
      lng,
      adm4Code,
      activity: "jogging" as const,
      transportMode: "walking" as const,
      plannedTime: "Sekarang",
      userQuestion: "Aman ngga kalau aku lari sore ini?"
    };

    console.log("   Building Context Aggregation...");
    const envContext = await buildEnvironmentalContext(userContext);
    
    console.log("   Requesting Gemini with Context...");
    const recommendation = await generateGeminiRecommendation(envContext, userContext.userQuestion);
    
    console.log("✅ Gemini Success:");
    console.log(`   Headline: ${recommendation.headline}`);
    console.log(`   Risk Level: ${recommendation.riskLevel}`);
    console.log(`   Recommendation: ${recommendation.recommendation}`);
    console.log(`   Reasoning: ${recommendation.reasoning.join(", ")}`);

    console.log("\n=== ALL TESTS PASSED ===");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error);
  }
}

runTests();
