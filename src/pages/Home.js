import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Autocomplete,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import allowsService from "../services/allowAllService";
import { API_URL } from "../services/apiService";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [contents, setContents] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredThemes, setFilteredThemes] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token'); // Leer el token del local storage
  const isLoggedIn = !!token; // Verificar si el token existe

  useEffect(() => {
    allowsService.getCategories().then((response) => {
      const sortedCategories = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setCategories(sortedCategories);
      setFilteredCategories(sortedCategories);
    });
    allowsService.getThemes().then((response) => {
      const sortedThemes = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setThemes(sortedThemes);
      setFilteredThemes(sortedThemes);
    });
    allowsService.getContents().then((response) => {
      const sortedContents = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setContents(sortedContents);
      setFilteredContents(sortedContents);
    });
  }, []);

  useEffect(() => {
    const options = [
      ...categories.map((cat) => ({ label: cat.name, type: "category" })),
      ...themes.map((theme) => ({ label: theme.name, type: "theme" })),
      ...contents.map((content) => ({ label: content.title, type: "content" })),
    ];
    setSearchOptions(options);
  }, [categories, themes, contents]);

  const handleSearch = (event, value) => {
    const lowercasedValue = value.toLowerCase();

    const filtered = contents.filter(
      (content) =>
        content.title.toLowerCase().includes(lowercasedValue) ||
        (content.text && content.text.toLowerCase().includes(lowercasedValue))
    );
    const filteredCategories = categories.filter((category) =>
      category.name.toLowerCase().includes(lowercasedValue)
    );
    const filteredThemes = themes.filter((theme) =>
      theme.name.toLowerCase().includes(lowercasedValue)
    );

    if (lowercasedValue === "") {
      setFilteredCategories(categories);
      setFilteredContents(contents);
      setFilteredThemes(themes);
    } else {
      setFilteredCategories(filteredCategories);
      setFilteredContents(filtered);
      setFilteredThemes(filteredThemes);
    }
  };

  const handleCategoryClick = (id) => {
    navigate(`/categories/${id}`);
  };

  const handleThemeClick = (id) => {
    navigate(`/themes/${id}`);
  };

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

  let embedUrl;

  return (
    <Container sx={{ mt: 4 }} style={{ minHeight: "100vh", height: "100%" }}>
      <Typography variant="h2" gutterBottom>
        Multimedia Library
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Autocomplete
          options={searchOptions}
          getOptionLabel={(option) => option.label}
          onInputChange={handleSearch}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Content"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </Box>

      <Typography variant="h4" gutterBottom>
        Categories
      </Typography>
      {filteredCategories.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <HourglassEmptyIcon style={{ fontSize: 80, color: "gray" }} />
          <Typography variant="h6" color="textSecondary">
            No data available, coming soon!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredCategories.map((category) => (
            <Grid item key={category._id} xs={12} sm={6} md={4}>
              <Card onClick={() => handleCategoryClick(category._id)}>
                <CardContent sx={{ position: "relative" }}>
                  <Typography variant="h5" component="div">
                    {category.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ position: "absolute", top: 8, right: 16 }}
                  >
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </Typography>
                  {isLoggedIn && (
                    <CardMedia
                      component="img"
                      style={{ width: "100%", height: "100%", padding: "1rem" }}
                      image={`${API_URL}${category.coverImageUrl}`}
                      alt={category.name}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Themes
      </Typography>
      {filteredThemes.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <HourglassEmptyIcon style={{ fontSize: 80, color: "gray" }} />
          <Typography variant="h6" color="textSecondary">
            No data available, coming soon!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredThemes.map((theme) => (
            <Grid item key={theme._id} xs={12} sm={6} md={4}>
              <Card onClick={() => handleThemeClick(theme._id)}>
                <CardContent sx={{ position: "relative" }}>
                  <Typography variant="h5" component="div">
                    {theme.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ position: "absolute", top: 8, right: 16 }}
                  >
                    {new Date(theme.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Contents
      </Typography>
      {filteredContents.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <HourglassEmptyIcon style={{ fontSize: 80, color: "gray" }} />
          <Typography variant="h6" color="textSecondary">
            No data available, coming soon!
          </Typography>
        </Box>
      ) : (
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
                  {content.type === "image" && isLoggedIn && (
                    <CardMedia
                      component="img"
                      style={{ width: "100%", height: "100%", padding: "1rem" }}
                      image={`${API_URL}${content.image}`}
                      alt={content.title}
                    />
                  )}
                  {content.type === "video" && isLoggedIn && (
                    <Typography variant="body2" color="text.secondary">
                      {content.url ? (
                        ((embedUrl = isYouTubeUrl(content.url)
                          ? `https://www.youtube.com/embed/${getYouTubeEmbedUrl(
                              content.url
                            )}`
                          : content.url),
                        (
                          <CardMedia
                            component="iframe"
                            src={embedUrl}
                            title="Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: "100%", height: "315px" }} // Ajusta el tamaño del iframe según sea necesario
                          />
                        ))
                      ) : (
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch Video
                        </a>
                      )}
                    </Typography>
                  )}
                  {content.type === "text" && (
                    <Typography
                      style={{ padding: "1rem" }}
                      variant="body2"
                      color="text.secondary"
                    >
                      {content.text}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
