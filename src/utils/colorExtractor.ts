
import ColorThief from 'colorthief';

// Function to extract dominant color from an image
export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(img);
        resolve(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      };
      
      img.onerror = () => {
        // Return a default color if there's an error
        resolve('rgb(75, 85, 99)');
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error extracting color:', error);
    // Return a default color if there's an error
    return 'rgb(75, 85, 99)';
  }
};

// Function to extract color palette from an image
export const extractColorPalette = async (imageUrl: string, colorCount: number = 5): Promise<string[]> => {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, colorCount);
        const colors = palette.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
        resolve(colors);
      };
      
      img.onerror = () => {
        // Return default colors if there's an error
        resolve(['rgb(75, 85, 99)', 'rgb(55, 65, 81)', 'rgb(31, 41, 55)', 'rgb(17, 24, 39)', 'rgb(0, 0, 0)']);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error extracting color palette:', error);
    // Return default colors if there's an error
    return ['rgb(75, 85, 99)', 'rgb(55, 65, 81)', 'rgb(31, 41, 55)', 'rgb(17, 24, 39)', 'rgb(0, 0, 0)'];
  }
};
