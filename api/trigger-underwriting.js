export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // --- CONFIGURATION ---
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = "jtmadoff";
  const REPO = "macallan-underwriting-engine";
  const WORKFLOW_FILENAME = "irr_engine.yml"; // Must match your .github/workflows filename
  const REF = "main"; // Must match your branch name

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ message: "Missing GitHub token in environment." });
  }

  // --- GITHUB API CALL ---
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILENAME}/dispatches`;
  const payload = { ref: REF };
  try {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const respText = await result.text();
    let respJson = {};
    try {
      respJson = JSON.parse(respText);
    } catch (e) {
      respJson = { raw: respText };
    }

    if (result.ok) {
      return res.status(200).json({ message: "✅ Workflow triggered successfully!" });
    } else {
      // Log extra details for debugging
      console.error("GitHub API error:", respJson);
      return res.status(500).json({ 
        message: "❌ Failed to trigger workflow", 
        error: respJson, 
        status: result.status 
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "❌ Server error", error: error.toString() });
  }
}
