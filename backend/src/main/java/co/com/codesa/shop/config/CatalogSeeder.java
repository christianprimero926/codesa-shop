package co.com.codesa.shop.config;

import co.com.codesa.shop.domain.Category;
import co.com.codesa.shop.domain.Coupon;
import co.com.codesa.shop.domain.Product;
import co.com.codesa.shop.repository.CategoryRepository;
import co.com.codesa.shop.repository.CouponRepository;
import co.com.codesa.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogSeeder implements SmartInitializingSingleton {

    private static final String IMAGE_URL = "https://picsum.photos/seed/%s-%d/600/450";

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final TransactionTemplate transactionTemplate;

    // Corre antes de que Tomcat acepte peticiones: el catalogo nunca se ve vacio al arrancar
    @Override
    public void afterSingletonsInstantiated() {
        transactionTemplate.executeWithoutResult(status -> {
            // Solo se carga si la base esta vacia, asi un reinicio no repone stock
            if (categoryRepository.count() == 0 && productRepository.count() == 0) {
                seedCatalog();
            }
            if (couponRepository.count() == 0) {
                seedCoupons();
            }
        });
    }

    private void seedCatalog() {
        Category audio = categoryRepository.save(Category.builder().name("Audio").build());
        Category peripherals = categoryRepository.save(Category.builder().name("Periféricos").build());
        Category computing = categoryRepository.save(Category.builder().name("Cómputo").build());
        Category phones = categoryRepository.save(Category.builder().name("Celulares").build());

        List<Product> products = List.of(
                product("Audífonos inalámbricos Pulse 300", "Sonik", audio, 289900L, 14, 4.5, "audio", 1,
                        "Audífonos over-ear con cancelación activa de ruido y hasta 40 horas de batería. "
                                + "Almohadillas acolchadas para jornadas largas y micrófono para llamadas."),
                product("Parlante Bluetooth Boom Mini", "Sonik", audio, 89900L, 25, 4.1, "audio", 2,
                        "Parlante portátil resistente al agua con sonido 360°. "
                                + "Ideal para la playa o el parque, con 12 horas de reproducción."),
                product("Barra de sonido Cinema 2.1", "Lumen", audio, 749900L, 0, 4.3, "audio", 3,
                        "Barra de sonido con subwoofer inalámbrico y conexión HDMI ARC. "
                                + "Modos de cine, música y voz para tu sala."),
                product("Teclado mecánico K70 RGB", "Keyra", peripherals, 329900L, 2, 4.7, "perifericos", 1,
                        "Teclado mecánico con switches rojos e iluminación RGB por tecla. "
                                + "Estructura en aluminio y reposamuñecas magnético."),
                product("Mouse inalámbrico Glide", "Keyra", peripherals, 119900L, 18, 4.2, "perifericos", 2,
                        "Mouse ergonómico con sensor de 16.000 DPI y conexión dual Bluetooth y 2.4 GHz. "
                                + "Batería recargable que dura hasta 70 días."),
                product("Monitor View 27\" QHD", "Lumen", peripherals, 1249900L, 7, 4.6, "perifericos", 3,
                        "Monitor IPS de 27 pulgadas con resolución 2560x1440 y 165 Hz. "
                                + "Base ajustable en altura y colores calibrados de fábrica."),
                product("Portátil Aero 14", "Novatek", computing, 3200000L, 5, 4.8, "computo", 1,
                        "Portátil ultraliviano con pantalla OLED de 14 pulgadas, 16 GB de RAM y 1 TB SSD. "
                                + "Pensado para trabajo y estudio con hasta 12 horas de autonomía."),
                product("Mini PC Cube i5", "Novatek", computing, 1890000L, 9, 4.0, "computo", 2,
                        "Computador compacto con procesador de 12 núcleos y 16 GB de RAM. "
                                + "Cabe detrás del monitor y soporta hasta tres pantallas."),
                product("Disco SSD NVMe 1 TB", "Vortex", computing, 349900L, 22, 4.9, "computo", 3,
                        "Unidad de estado sólido PCIe 4.0 con lecturas de hasta 7.000 MB/s. "
                                + "Incluye disipador para portátiles y consolas."),
                product("Celular Orbis X5 128 GB", "Orbis", phones, 1499900L, 12, 4.4, "celulares", 1,
                        "Pantalla AMOLED de 6,5 pulgadas, cámara principal de 108 MP y carga rápida de 67 W. "
                                + "Batería de 5.000 mAh para todo el día."),
                product("Celular Orbis Lite 64 GB", "Orbis", phones, 699900L, 16, 3.8, "celulares", 2,
                        "Celular de entrada con pantalla de 6,1 pulgadas y doble cámara. "
                                + "Liviano, con lector de huella y batería de larga duración."),
                product("Cargador rápido GaN 65 W", "Vortex", phones, 129900L, 20, 4.6, "celulares", 3,
                        "Cargador compacto con dos puertos USB-C y uno USB-A. "
                                + "Carga celular, tablet y portátil al mismo tiempo."));
        productRepository.saveAll(products);
        log.info("Catalogo inicial cargado con {} productos", products.size());
    }

    private void seedCoupons() {
        couponRepository.saveAll(List.of(
                Coupon.builder().code("CODESA10").percent(10).minSubtotal(100000L).maxDiscount(80000L).build(),
                Coupon.builder().code("BIENVENIDO25").percent(25).minSubtotal(400000L).build(),
                Coupon.builder().code("NAVIDAD2025").percent(20).minSubtotal(0L)
                        .expiresAt(LocalDate.of(2025, 12, 31)).build()));
        log.info("Cupones iniciales cargados");
    }

    private Product product(String name, String brand, Category category, Long price, int stock, double rating,
                            String slug, int index, String description) {
        return Product.builder()
                .name(name)
                .brand(brand)
                .category(category)
                .price(price)
                .stock(stock)
                .rating(rating)
                .image(String.format(IMAGE_URL, slug, index))
                .description(description)
                .build();
    }
}
