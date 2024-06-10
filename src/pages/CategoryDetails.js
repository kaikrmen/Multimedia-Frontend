import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
} from "@mui/material";
import allowsService from "../services/allowAllService";
import { API_URL } from "../services/apiService";
import categoryService from "../services/categoryService";

const CategoryDetails = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);

  useEffect(() => {
    categoryService.getCategory(id).then((response) => {
      setCategory(response.data);
    });

    allowsService.getContents().then((response) => {
      const allContents = response.data;
      const filtered = allContents.filter((content) => content.category._id === id);
      setContents(allContents);
      setFilteredContents(filtered);
    });
  }, [id]);

  const isYouTubeUrl = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split("v=")[1];
    const ampersandPosition = videoId ? videoId.indexOf("&") : -1;
    return ampersandPosition !== -1
      ? videoId.substring(0, ampersandPosition)
      : videoId;
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <Container style={{ minHeight: "100vh", height: "100%" }}>
      <Box
        sx={{
          position: 'relative',
          height: '300px',
          mb: 4,
          backgroundImage: `url(${API_URL}${category.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Typography variant="h2" color="white" textAlign="center">
            {category.name}
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={4}>
        {filteredContents.map((content) => (
          <Grid item key={content._id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ position: "relative" }}>
                <Typography variant="h5" component="div">
                  {content.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ position: "absolute", top: 5, right: 16 }}
                >
                  {new Date(content.updatedAt).toLocaleDateString()}
                </Typography>
                {content.type === "image" && (
                  <CardMedia
                    component="img"
                    style={{ width: "100%", height: "100%", padding: "1rem" }}
                    image={`${API_URL}${content.image}`}
                    alt={content.title}
                  />
                )}
                {content.type === "video" && (
                  <>
                    {isYouTubeUrl(content.url) ? (
                      <CardMedia
                        component="iframe"
                        src={`https://www.youtube.com/embed/${getYouTubeEmbedUrl(
                          content.url
                        )}`}
                        title="Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: "100%", height: "315px" }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch Video
                        </a>
                      </Typography>
                    )}
                  </>
                )}
                {content.type === "text" && (
                  <Typography variant="body2" color="text.secondary">
                    {content.text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoryDetails;
