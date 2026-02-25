import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buildShadow } from "./theme";

const curatedPlaylists = [
  {
    id: "focus",
    title: "Deep Focus",
    note: "Use this during study and work blocks.",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  },
  {
    id: "workout",
    title: "Workout Boost",
    note: "High-energy picks for training sessions.",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh",
  },
  {
    id: "recovery",
    title: "Calm Recovery",
    note: "Light tracks for cooldown and stretching.",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj",
  },
];

const buildSpotifyOEmbedUrl = (spotifyUrl) =>
  `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;

export default function MusicScreen({ theme }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const [spotifyUrl, setSpotifyUrl] = useState(curatedPlaylists[0].url);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasInput = useMemo(() => spotifyUrl.trim().length > 0, [spotifyUrl]);

  const openSpotify = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Spotify link failed", "Could not open Spotify on this device.");
    }
  };

  const loadSpotifyPreview = async (targetUrl = spotifyUrl) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMessage("Paste a Spotify track/album/playlist URL first.");
      return;
    }

    if (!cleanUrl.includes("open.spotify.com") && !cleanUrl.startsWith("spotify:")) {
      setErrorMessage("Use a Spotify URL. Example: https://open.spotify.com/playlist/...");
      return;
    }

    setLoadingPreview(true);
    setErrorMessage("");

    try {
      const response = await fetch(buildSpotifyOEmbedUrl(cleanUrl));
      if (!response.ok) {
        throw new Error(`Spotify oEmbed returned ${response.status}`);
      }

      const data = await response.json();
      setPreview({
        title: data.title,
        authorName: data.author_name,
        thumbnail: data.thumbnail_url,
        sourceUrl: cleanUrl,
      });
    } catch (error) {
      setPreview(null);
      setErrorMessage("Spotify preview is unavailable right now. You can still open links directly.");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentWrap, { maxWidth: isDesktop ? 1040 : 720 }]}>
          <View style={[styles.hero, { backgroundColor: theme.colors.surface }, buildShadow(theme, 8)]}>
            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Music</Text>
            <Text style={[styles.heroSubtitle, { color: theme.colors.textMuted }]}>
              Connect to Spotify links and keep a wellness soundtrack ready for focus, workouts, and recovery.
            </Text>

            <TextInput
              value={spotifyUrl}
              onChangeText={setSpotifyUrl}
              autoCapitalize="none"
              placeholder="Paste Spotify URL"
              placeholderTextColor={theme.colors.placeholder}
              style={[
                styles.urlInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                },
              ]}
            />

            <TouchableOpacity
              onPress={() => loadSpotifyPreview()}
              style={[
                styles.previewBtn,
                { backgroundColor: theme.colors.primary },
                (!hasInput || loadingPreview) && { opacity: 0.7 },
              ]}
              disabled={!hasInput || loadingPreview}
              activeOpacity={0.88}
            >
              {loadingPreview ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="sparkles-outline" size={17} color="#fff" />
              )}
              <Text style={styles.previewBtnText}>
                {loadingPreview ? "Loading preview..." : "Load Spotify API preview"}
              </Text>
            </TouchableOpacity>

            {errorMessage ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{errorMessage}</Text> : null}

            {preview ? (
              <View
                style={[
                  styles.previewCard,
                  { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border },
                ]}
              >
                {preview.thumbnail ? (
                  <Image source={{ uri: preview.thumbnail }} style={styles.previewImage} resizeMode="cover" />
                ) : null}
                <View style={styles.previewMeta}>
                  <Text style={[styles.previewTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {preview.title || "Spotify Item"}
                  </Text>
                  <Text style={[styles.previewAuthor, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {preview.authorName || "Spotify"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openSpotify(preview.sourceUrl)}
                    style={[styles.openBtn, { backgroundColor: theme.colors.primarySoft }]}
                  >
                    <Ionicons name="logo-spotify" size={16} color={theme.colors.primary} />
                    <Text style={[styles.openBtnText, { color: theme.colors.primary }]}>Open in Spotify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Playlists</Text>
          <View style={styles.playlistGrid}>
            {curatedPlaylists.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.playlistCard,
                  {
                    width: isDesktop ? "32%" : "100%",
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  buildShadow(theme, 3),
                ]}
              >
                <Text style={[styles.playlistTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.playlistNote, { color: theme.colors.textMuted }]}>{item.note}</Text>

                <TouchableOpacity
                  onPress={() => {
                    setSpotifyUrl(item.url);
                    loadSpotifyPreview(item.url);
                  }}
                  style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
                >
                  <Ionicons name="sparkles-outline" size={15} color={theme.colors.text} />
                  <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>Load API preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openSpotify(item.url)}
                  style={[styles.spotifyBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="logo-spotify" size={17} color="#fff" />
                  <Text style={styles.spotifyBtnText}>Play on Spotify</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  contentWrap: {
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  heroSubtitle: {
    marginTop: 5,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 19,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  previewBtn: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  previewBtnText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  previewCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  previewImage: {
    width: 74,
    height: 74,
    borderRadius: 10,
  },
  previewMeta: {
    flex: 1,
    marginLeft: 10,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  previewAuthor: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  openBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  openBtnText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  playlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  playlistCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  playlistNote: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  spotifyBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spotifyBtnText: {
    marginLeft: 7,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
