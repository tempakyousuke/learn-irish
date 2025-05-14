export const getYoutubeId = (url?: string): string | null => {
	if (!url) return null;
	const regex =
		/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

	const match = url.match(regex);
	const id = match ? match[1] : null;
	return id;
};
