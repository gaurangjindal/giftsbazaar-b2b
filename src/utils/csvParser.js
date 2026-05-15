import Papa from 'papaparse';

/**
 * Parses a CSV file and returns the data.
 * Handles duplicate Product Codes by keeping the row with the most image data.
 * @param {File} file 
 * @returns {Promise<Array>}
 */
export const parseCsvFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        // First pass: clean all rows
        const allRows = results.data.map(row => {
          const cleanRow = {};
          for (const key in row) {
            if (Object.hasOwnProperty.call(row, key)) {
              const val = row[key];
              cleanRow[key.trim()] = typeof val === 'string' ? val.trim() : (val || '');
            }
          }
          cleanRow.id = cleanRow['Product Code'] || cleanRow['Sku Id'] || crypto.randomUUID();
          return cleanRow;
        });

        // Second pass: deduplicate by Product Code, keeping the row with the most data
        const productMap = new Map();
        
        for (const row of allRows) {
          const id = row.id;
          const existing = productMap.get(id);
          
          if (!existing) {
            productMap.set(id, row);
          } else {
            // Merge: prefer the row that has Image 1 populated
            const existingHasImg = existing['Image 1'] && existing['Image 1'].startsWith('http');
            const newHasImg = row['Image 1'] && row['Image 1'].startsWith('http');
            
            if (newHasImg && !existingHasImg) {
              // New row has image, existing doesn't — replace
              productMap.set(id, row);
            } else if (existingHasImg && !newHasImg) {
              // Existing has image, new doesn't — merge non-empty fields from new into existing
              for (const key of Object.keys(row)) {
                if (row[key] && !existing[key]) {
                  existing[key] = row[key];
                }
              }
            } else {
              // Both have images or both don't — merge, preferring non-empty values
              for (const key of Object.keys(row)) {
                if (row[key] && !existing[key]) {
                  existing[key] = row[key];
                }
              }
            }
          }
        }

        // Third pass: set imageUrl for each product
        const cleanedData = Array.from(productMap.values()).map(cleanRow => {
          // Collect all valid image URLs
          const img1 = cleanRow['Image 1'] || '';
          if (img1.startsWith('http://') || img1.startsWith('https://')) {
            cleanRow.imageUrl = img1;
          } else {
            // Check other image fields as fallback
            let found = false;
            for (let i = 2; i <= 10; i++) {
              const imgN = cleanRow['Image ' + i] || '';
              if (imgN.startsWith('http://') || imgN.startsWith('https://')) {
                cleanRow.imageUrl = imgN;
                found = true;
                break;
              }
            }
            if (!found) {
              cleanRow.imageUrl = 'https://placehold.co/400x400/f5f5f0/999999?text=' + encodeURIComponent(cleanRow['Name'] || 'Product');
            }
          }
          return cleanRow;
        });

        resolve(cleanedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
