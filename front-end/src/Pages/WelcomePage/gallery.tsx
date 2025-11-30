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
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        justifySelf: 'center',
        alignItems: "center",
        alignSelf: 'center',
        py: 4,
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        The Social Gallery
      </Typography>

      <ImageList
        sx={{
          width: "100%",
          maxWidth: {
            xs: 350, // mobile
            sm: 600, // tablet
            md: 1200, // desktop
          },
          maxHeight: 1000,
          overflow: "hidden",
          borderRadius: 2,
          mx: "auto", // centers horizontally
          px: 1, // small inner padding for mobile
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
