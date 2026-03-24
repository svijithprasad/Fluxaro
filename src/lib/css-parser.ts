/**
 * Parses a CSS string (e.g. "border: 2px solid red; box-shadow: 0 0 10px black")
 * into a React.CSSProperties object.
 */
export function parseCssToReactStyles(
  cssString: string
): React.CSSProperties {
  if (!cssString || !cssString.trim()) return {};

  const styles: Record<string, string> = {};

  // Split by semicolons, filter empty
  const declarations = cssString
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    if (!property || !value) continue;

    // Convert CSS property to camelCase (e.g. "border-radius" -> "borderRadius")
    const camelCase = property.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    styles[camelCase] = value;
  }

  return styles as React.CSSProperties;
}
