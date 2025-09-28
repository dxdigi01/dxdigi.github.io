// GitHub API ile indirme istatistiklerini çeken script oluştur
async function loadGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/repos/dxdigi01/dxdigi.github.io/releases/latest');
        if (response.ok) {
            const release = await response.json();
            
            let totalDownloads = 0;
            let debDownloads = 0;
            let exeDownloads = 0;
            
            release.assets.forEach(asset => {
                totalDownloads += asset.download_count;
                
                if (asset.name.includes('.deb')) {
                    debDownloads = asset.download_count;
                } else if (asset.name.includes('.exe')) {
                    exeDownloads = asset.download_count;
                }
            });
            
            // Global downloadStats'i güncelle
            downloadStats = {
                total: totalDownloads,
                deb: debDownloads,
                exe: exeDownloads
            };
            
            updateStatsDisplay();
            console.log('GitHub istatistikleri yüklendi:', downloadStats);
        }
    } catch (error) {
        console.log('GitHub API hatası:', error);
    }
}

// Her 30 saniyede bir güncelle
setInterval(loadGitHubStats, 30000);
