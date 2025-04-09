const FAVORITES_KEY = "eco_market_favorites";

const getUserFavorites = (userId: string): string[] => {
  const allFavorites = localStorage.getItem(FAVORITES_KEY);

  if (!allFavorites) {
    return [];
  }

  const favoritesMap = JSON.parse(allFavorites);
  return favoritesMap[userId] || [];
};

const saveUserFavorites = (userId: string, favorites: string[]) => {
  const allFavorites = localStorage.getItem(FAVORITES_KEY);
  const favoritesMap = allFavorites ? JSON.parse(allFavorites) : {};

  favoritesMap[userId] = favorites;

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesMap));
};

export const getFavorites = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getUserFavorites(userId);
};

export const addToFavorites = async (userId: string, materialId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const favorites = getUserFavorites(userId);

  if (favorites.includes(materialId)) {
    return favorites;
  }

  const updatedFavorites = [...favorites, materialId];
  saveUserFavorites(userId, updatedFavorites);

  return updatedFavorites;
};

export const removeFromFavorites = async (
  userId: string,
  materialId: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const favorites = getUserFavorites(userId);
  const updatedFavorites = favorites.filter((id) => id !== materialId);

  saveUserFavorites(userId, updatedFavorites);

  return updatedFavorites;
};
