import React from "react";
import RawMaterialPreview from "./RawMaterialPreview";

// Wrapper component: Process Material IC reuses the Raw Material IC layout.
// We keep a separate name so existing routes/components don't need changes.
export default function ProcessMaterialPreview(props) {
  return <RawMaterialPreview {...props} />;
}
