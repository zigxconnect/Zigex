/**
 * A simple test page.
 * If this page loads, it proves that the (dashboard) route group and its layout are working.
 */
export default function TestPage() {
  return (
    <div style={{ padding: "40px", backgroundColor: "lightgreen" }}>
      <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
        Test Page Loaded Successfully!
      </h1>
      <p style={{ marginTop: "20px" }}>
        This means the problem is ONLY with the dynamic `internships/[id]`
        folder structure.
      </p>
    </div>
  );
}
