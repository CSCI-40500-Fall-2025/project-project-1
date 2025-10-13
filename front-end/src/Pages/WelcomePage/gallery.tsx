import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { Typography, Box } from "@mui/material";
import galleryImages from "./galleryImages";

function srcset(image: string, size: number, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

export default function Gallery() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        The Social Gallery
      </Typography>

      <ImageList
              sx={{
                  marginLeft: '10px', 
                  marginRight: '10px',
          width: "auto",
            maxWidth: 1000,
          maxHeight: 1000,
          overflow: "hidden",
          borderRadius: 2,
        }}
        variant="quilted"
        cols={4}
        rowHeight={121}
      >
        {galleryImages.map((item) => (
          <ImageListItem
            key={item.img}
            cols={item.cols || 1}
            rows={item.rows || 1}
          >
            <img
              {...srcset(item.img, 180, item.rows, item.cols)}
              alt={item.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
                borderRadius: "8px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}
