Proje açıklaması;

Bu proje, kullanıcıların ürünleri çevrimiçi olarak keşfedip inceleyebildiği, modern bir İlerici Web Uygulaması (PWA) olarak geliştirilmiştir. Uygulama; ürün listeleri ve detay sayfaları aracılığıyla içerik sunarken, Hakkında ve İletişim bölümleriyle proje amacı ve geliştirici hakkında bilgi vermektedir.

Duyarlı (responsive) arayüz tasarımı sayesinde masaüstü ve mobil cihazlarda sorunsuz bir kullanım deneyimi sağlar. PWA mimarisi sayesinde uygulama cihaza kısayol olarak eklenebilir, çevrimdışı senaryolarda daha önce ziyaret edilen içerikler görüntülenebilir ve kullanıcıya hızlı, uygulama benzeri bir deneyim sunar.


<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/e03a1863-743a-4dc1-a756-f6a4a35842a2" />
<img width="1901" height="964" alt="image" src="https://github.com/user-attachments/assets/359456b7-766c-483b-b389-63836584e001" />
<img width="1918" height="972" alt="image" src="https://github.com/user-attachments/assets/4774f061-affb-412e-9190-73680f9e4296" />
<img width="1905" height="963" alt="image" src="https://github.com/user-attachments/assets/1189b830-36d7-4923-94bc-6aebd0a8dd0b" />
<img width="1919" height="964" alt="image" src="https://github.com/user-attachments/assets/fcba457e-6d40-494e-827d-508b61ccda3f" />
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/698210a0-7837-4be3-a787-c033aba18b5b" />


Kullanılan api= https://pokeapi.co/api/v2
</br>
Örnek Endpoint;
const res = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`, { cache: "no-store" });
      if (!res.ok) throw new Error('Pokemon list fetch failed');


Kullanılan CSS çatısı: tailwind

PWA özellikleri: Uygulama; ana ekrana eklenebilme ve bağımsız bir uygulama gibi çalışabilme özelliklerine sahiptir. Bu kapsamda uygulama adı, kısa adı, simgeleri, tema rengi ve arka plan rengi tanımlanmış olup tam ekran (standalone) görünümde açılacak şekilde yapılandırılmıştır.

Farklı çözünürlükler için çoklu ikon desteği sayesinde uygulama, çeşitli cihaz ve platformlarda tutarlı ve doğru bir kısayol/ikon görünümü sunar. Uygulama, yalnızca dikey kullanım için optimize edilmiş olup belirlenen ekran yönünde çalışacak şekilde sınırlandırılmıştır.

Uygulama kabuğunun (HTML sayfaları, temel JavaScript dosyaları ve örnek veri dosyaları) önbelleğe alınması sayesinde ilk yüklemeden sonra çok daha hızlı açılmaktadır. İnternet bağlantısının kesilmesi veya sunucuya erişilememesi durumunda, kullanıcıya özel olarak hazırlanmış bir çevrimdışı sayfa gösterilerek kontrollü bir offline deneyimi sağlanmaktadır.

API isteklerinde ağdan veri çekmeyi önceliklendiren, bağlantı olmadığı durumlarda ise daha önce önbelleğe alınmış yanıtı ya da açıklayıcı bir hata mesajı döndüren bir strateji kullanılmaktadır. Statik dosyalar için ise önbellekten hızlı yanıt verirken arka planda güncel sürümü ağdan çekerek yenileyen bir yaklaşım uygulanmakta, böylece hız ve güncellik dengesi korunmaktadır.

Önbellek sürümleme ve eski önbelleklerin temizlenmesi sayesinde uygulama güncellemelerinde bozuk veya tutarsız veri riski azaltılmakta; yeni bir sürüm yüklendiğinde eski servis çalışanın hızlıca devre dışı bırakılabilmesi için bekleme atlama (skip waiting) mekanizması desteklenmektedir.

canlı demo linki; https://pokemon-urunler.netlify.app/
