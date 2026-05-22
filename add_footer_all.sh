#!/bin/bash

# Footer HTML
FOOTER='<!-- Footer Atención al Cliente -->
<footer class="customer-service-footer">
  <div class="footer-container">
    <div class="footer-header">
      <span class="pulse-dot"></span>
      <h3 class="footer-title">📞 ATENCIÓN AL CLIENTE - DERIVAR RECLAMOS</h3>
      <span class="pulse-dot"></span>
    </div>
    
    <div class="countries-grid">
      <div class="country-card" style="animation-delay: 0.1s">
        <div class="flag">🇭🇳</div>
        <div class="country-info">
          <div class="country-name">Honduras</div>
          <div class="phone-number">2263 0227</div>
        </div>
      </div>
      <div class="country-card" style="animation-delay: 0.2s">
        <div class="flag">🇳🇮</div>
        <div class="country-info">
          <div class="country-name">Nicaragua</div>
          <div class="phone-number">7513 2174</div>
        </div>
      </div>
      <div class="country-card" style="animation-delay: 0.3s">
        <div class="flag">🇬🇹</div>
        <div class="country-info">
          <div class="country-name">Guatemala</div>
          <div class="phone-number">2378 4861</div>
        </div>
      </div>
      <div class="country-card" style="animation-delay: 0.4s">
        <div class="flag">🇸🇻</div>
        <div class="country-info">
          <div class="country-name">El Salvador</div>
          <div class="phone-number">2136 8772</div>
        </div>
      </div>
      <div class="country-card" style="animation-delay: 0.5s">
        <div class="flag">🇵🇦</div>
        <div class="country-info">
          <div class="country-name">Panamá</div>
          <div class="phone-number">838 8339</div>
        </div>
      </div>
      <div class="country-card" style="animation-delay: 0.6s">
        <div class="flag">🇩🇴</div>
        <div class="country-info">
          <div class="country-name">Rep. Dominicana</div>
          <div class="phone-number">182-9946-0346</div>
        </div>
      </div>
    </div>
    <div class="footer-tip">
      💡 Usa estos números para derivar cualquier tipo de reclamo
    </div>
  </div>
</footer>

<link rel="stylesheet" href="footer-styles.css">'

# Procesar todos los archivos HTML excepto index.html
for file in *.html; do
  if [ "$file" != "index.html" ] && [ "$file" != "footer-customer-service.html" ]; then
    # Verificar si ya tiene el footer
    if ! grep -q "customer-service-footer" "$file"; then
      # Buscar la línea antes de </body>
      sed -i "s|</body>|${FOOTER}\n\n</body>|" "$file"
      echo "✓ Footer agregado a: $file"
    else
      echo "⊘ Ya existe en: $file"
    fi
  fi
done

echo "✓ Proceso completado"
