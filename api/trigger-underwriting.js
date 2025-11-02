export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const OWNER = "jtmadoff";
  const REPO = "macallan-underwriting-engine";
  const WORKFLOW_FILENAME = "irr_engine.yml"; // Change if needed
  const REF = "main";

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ message: "Missing GitHub token in environment." });
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILENAME}/dispatches`;
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ref: REF })
  });

  if (result.ok) {
    return res.status(200).json({ message: "✅ Workflow triggered successfully!" });
  } else {
    const err = await result.text();
    return res.status(500).json({ message: "❌ Failed to trigger workflow", error: err });
  }
}
