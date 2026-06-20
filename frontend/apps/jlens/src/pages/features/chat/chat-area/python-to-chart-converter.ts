/**
 * Converts Python matplotlib code to chart JSON format
 */
export function convertPythonToChartJson(content: string): string {
  // Check if content contains matplotlib code
  if (!content.includes('matplotlib') && !content.includes('plt.barh') && !content.includes('plt.bar')) {
    return content;
  }

  try {
    // Extract categories/labels - handle multiline arrays
    const categoriesMatch = content.match(/categories\s*=\s*\[([^\]]+)\]/s);
    const labelsMatch = content.match(/labels\s*=\s*\[([^\]]+)\]/s);
    
    // Extract values - handle multiline arrays
    const valuesMatch = content.match(/values\s*=\s*\[([^\]]+)\]/s);
    
    // Extract title
    const titleMatch = content.match(/plt\.title\(['"](.*?)['"]\)/);
    
    if ((categoriesMatch || labelsMatch) && valuesMatch) {
      // Parse categories/labels - handle quoted strings with commas
      const labelsStr = (categoriesMatch || labelsMatch)![1];
      const labels = labelsStr
        .split(/["']\s*,\s*["']/)
        .map(s => s.replace(/^["'\s]+|["'\s]+$/g, ''))
        .filter(s => s.length > 0);
      
      // Parse values - handle floats
      const valuesStr = valuesMatch[1];
      const values = valuesStr
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(v => !isNaN(v));
      
      // Determine chart type
      const isHorizontal = content.includes('plt.barh');
      const chartType = isHorizontal ? 'horizontal-bar' : 'bar';
      
      // Extract colors if available
      const colorsMatch = content.match(/color\s*=\s*\[([^\]]+)\]/);
      let colors: string[] = [];
      if (colorsMatch) {
        colors = colorsMatch[1]
          .split(',')
          .map(s => s.trim().replace(/['"]/g, ''));
      }
      
      // Build chart JSON
      const chartData = {
        type: chartType,
        title: titleMatch ? titleMatch[1] : 'Market Potential',
        data: labels.map((label, i) => ({
          label: label,
          value: values[i] || 0,
          ...(colors[i] ? { color: colors[i] } : {})
        }))
      };
      
      // Create chart block
      const chartBlock = '\n\n```chart\n' + JSON.stringify(chartData, null, 2) + '\n```\n\n';
      
      // Replace Python code block with chart block
      let newContent = content.replace(
        /```python[\s\S]*?```/,
        chartBlock
      );
      
      // Also replace inline Python code if no code block
      if (newContent === content) {
        newContent = content.replace(
          /import matplotlib[\s\S]*?plt\.show\(\)/,
          chartBlock
        );
      }
      
      return newContent;
    }
  } catch (error) {
    console.error('Failed to convert Python to chart:', error);
  }
  
  return content;
}
