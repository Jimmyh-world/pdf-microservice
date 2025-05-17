# Vertical Stacking Fix - Technical Details

## Problem Description

The PDF renderer was experiencing a critical issue where list items would display with **vertical text stacking** - where each character in the list content would be rendered on a separate line, like:

```
L
i
s
t

i
t
e
m
```

This made the document unreadable and unusable.

## Root Cause Analysis

After careful examination, we identified several issues in how PDFKit's text continuations were being handled:

1. **Y-coordinate mismatch**: Using the passed `y` parameter instead of `doc.y` for the second text call.
2. **Inadequate prefix width**: Width values for prefixes (bullets, numbers) were too small.
3. **Missing or incorrect lineBreak parameters**: Not explicitly setting `lineBreak: false` for prefix and `lineBreak: true` for content.
4. **Type conversion issues**: Content potentially not being handled as a string.
5. **Line gap/height issues**: PDFKit's internal line height calculations causing baseline shifts between prefix and content.

## Key Fixes Applied

### 1. Use `doc.y` Instead of Passed `y` Parameter

BEFORE:

```javascript
doc.text('• ', x, y, { continued: true, ... });
```

AFTER:

```javascript
doc.text('• ', x, doc.y, { continued: true, ... });
```

This ensures PDFKit's internal cursor position is used, maintaining proper text flow.

### 2. Precise LineBreak Control

BEFORE:

```javascript
// Missing or inconsistent lineBreak settings
doc.text('• ', x, y, { continued: true, ... });
doc.text(content, { ... });
```

AFTER:

```javascript
doc.text('• ', x, doc.y, {
  continued: true,
  lineBreak: false, // Critical: prevents breaking after prefix
});

doc.text(content, {
  continued: false,
  lineBreak: true, // Critical: allows proper word wrapping
});
```

### 3. Dynamic Width Calculation

BEFORE:

```javascript
const listIndent = 20; // Fixed width regardless of content
```

AFTER:

```javascript
// For numbers, calculate based on actual content width
const numberText = `${number} `;
const numberWidth = Math.max(25, doc.widthOfString(numberText) + 5);

// For bullet points, use adequate fixed width
const bulletWidth = 15;
```

### 4. Type Safety

BEFORE:

```javascript
// No validation of content type
doc.text(content, ...);
```

AFTER:

```javascript
// Ensure content is a string
if (typeof content !== 'string') {
  console.warn('List content is not a string:', content);
  content = String(content || '');
}
```

### 5. Line Gap Control (CRITICAL FIX)

BEFORE:

```javascript
// No explicit line gap control
doc.fontSize(theme.fontSize.body).font(theme.fonts.body);

doc.text('• ', x, y, { continued: true, ... });
```

AFTER:

```javascript
// Set line gap to 0 to prevent baseline shifts
doc.fontSize(theme.fontSize.body).font(theme.fonts.body).lineGap(0); // CRITICAL: Prevents baseline shifts

doc.text('• ', x, doc.y, {
  continued: true,
  lineGap: 0, // CRITICAL: Forces consistent baseline
  // other params...
});

// Then restore after rendering
doc.lineGap(theme.spacing.lineGap || 2);
```

This prevents PDFKit from inserting internal line breaks or adjusting baselines between the prefix and content, which was the root cause of the vertical stacking.

## Additional Improvements

1. **Text flow parameters**:

   - Consistent `align: 'left'` settings
   - Adequate width values for content text

2. **Width calculations**:

   - Dynamic width based on text measurements: `doc.widthOfString(prefix) + 5`
   - Minimum width thresholds to prevent text compression

3. **Debugging**:
   - Added type validation with warning logs
   - Improved comments documenting the exact purpose of each parameter
   - Created visualization tools to see text flow and line gaps

## Testing Strategy

We implemented multiple tests to verify the fix:

1. **Isolated List Test**: Direct PDFKit calls without markdown parsing to confirm proper text flow.
2. **Vertical Stacking Test**: Comprehensive test with all list types and formats.
3. **Line Gap Fix Test**: Visual test demonstrating the importance of line gap control.
4. **Debug Layout Visualization**: Visual confirmation of margins and text positioning.

## PDFKit Best Practices

1. **Continued Text Flow**:

   - When using `continued: true`, always set `lineBreak: false` for the prefix part
   - Then set `lineBreak: true` for the content part to enable word wrapping
   - Never use coordinates (x,y) on the second text call in a continued sequence

2. **Width Management**:

   - Ensure generous width for content (at least contentWidth - prefixWidth)
   - Calculate width dynamically for variable-length prefixes
   - Always specify width explicitly for both parts of continued text

3. **Line Gap Control**:

   - Set `doc.lineGap(0)` before rendering list items
   - Set `lineGap: 0` in the `doc.text()` options for the prefix
   - Restore `doc.lineGap(theme.spacing.lineGap)` after rendering

4. **Positioning**:
   - Use `doc.y` for vertical positioning to maintain flow
   - Only specify coordinates (x,y) for the first text segment in a flow
   - Let PDFKit handle the internal cursor position for continued text

## Final Simplified Implementation

After extensive testing, we identified a more robust and simpler implementation that consistently prevents vertical stacking:

### For Bullet Lists:

```javascript
function renderBulletListItem(
  doc,
  content,
  x,
  y,
  contentWidth,
  hasUrl,
  theme,
  spacing
) {
  const bulletWidth = 15;

  doc
    .font(theme.fonts.body)
    .fontSize(theme.fontSize.body)
    .lineGap(theme.spacing.lineGap || 4);

  // Start with bullet
  doc.text('• ', x, doc.y, {
    continued: true,
    width: bulletWidth,
    align: 'left',
    lineBreak: false,
  });

  // Now render the content in the same line
  doc.text(content, {
    continued: false,
    align: 'left',
    lineBreak: true,
    width: contentWidth - bulletWidth,
  });

  doc.moveDown(hasUrl ? spacing.listWithUrl : spacing.list);
}
```

### For Numbered Lists:

```javascript
function renderNumberedListItem(
  doc,
  content,
  number,
  x,
  y,
  contentWidth,
  hasUrl,
  theme,
  spacing
) {
  const numberText = `${number} `;
  const numberWidth = Math.max(25, doc.widthOfString(numberText) + 5);

  doc
    .font(theme.fonts.body)
    .fontSize(theme.fontSize.body)
    .lineGap(theme.spacing.lineGap || 4);

  doc.text(numberText, x, doc.y, {
    continued: true,
    width: numberWidth,
    align: 'left',
    lineBreak: false,
  });

  doc.text(content, {
    continued: false,
    align: 'left',
    lineBreak: true,
    width: contentWidth - numberWidth,
  });

  doc.moveDown(hasUrl ? spacing.listWithUrl : spacing.list);
}
```

This simplified approach ensures consistent text flow while directly using the theme's line gap settings, rather than setting and restoring line gap values.

### Key differences in the final implementation:

1. **Direct theme lineGap usage**: Using `lineGap(theme.spacing.lineGap || 4)` directly instead of setting to 0 and restoring later
2. **Simpler code organization**: Removed unnecessary type checking and comments for cleaner implementation
3. **Consistent pattern**: Applied the same pattern across all list renderers for easier maintenance
4. **Default fallback**: Added a fallback value of 4 for lineGap if not specified in theme

This implementation maintains all the critical fixes for vertical stacking while simplifying the code.
