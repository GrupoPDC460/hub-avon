// ============================================
// CHATBOT ASISTENTE AVON - 100% GRATIS
// Sin APIs externas, sin costos
// ============================================

class AvonChatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.directoryData = []; // Directorio cargado del JSON
    this.initKnowledgeBase();
    this.loadDirectory(); // Cargar directorio.json
    this.createChatbot();
    this.attachEventListeners();
    this.trackMetrics();
  }

  // Cargar directorio desde JSON
  async loadDirectory() {
    try {
      const response = await fetch('directorio.json');
      if (response.ok) {
        this.directoryData = await response.json();
        console.log('📇 Directorio cargado:', this.directoryData.length, 'contactos');
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar directorio.json:', error);
    }
  }

  // Buscar en el directorio
  searchDirectory(query) {
    if (!this.directoryData || this.directoryData.length === 0) {
      return null;
    }

    const lowerQuery = query.toLowerCase();
    
    // Buscar por país
    const byCountry = this.directoryData.filter(contact => 
      contact.PAIS && contact.PAIS.toLowerCase().includes(lowerQuery)
    );
    
    // Buscar por nombre
    const byName = this.directoryData.filter(contact =>
      contact.Nombre && contact.Nombre.toLowerCase().includes(lowerQuery)
    );
    
    // Buscar por división
    const byDivision = this.directoryData.filter(contact =>
      contact.División && contact.División.toLowerCase().includes(lowerQuery)
    );
    
    // Buscar por gestor
    const byGestor = this.directoryData.filter(contact =>
      contact.GESTOR && contact.GESTOR.toLowerCase().includes(lowerQuery)
    );
    
    // Buscar por zona (NUEVO)
    const byZona = this.directoryData.filter(contact =>
      contact['Zona o cargo'] && contact['Zona o cargo'].toString().includes(lowerQuery.replace('zona', '').trim())
    );
    
    // Buscar por correo
    const byEmail = this.directoryData.filter(contact =>
      contact.Correo && contact.Correo.toLowerCase().includes(lowerQuery)
    );
    
    // Buscar por teléfono
    const byPhone = this.directoryData.filter(contact =>
      contact.Contacto && contact.Contacto.toString().includes(lowerQuery.replace(/\D/g, ''))
    );
    
    return {
      byCountry,
      byName,
      byDivision,
      byGestor,
      byZona,
      byEmail,
      byPhone,
      total: byCountry.length + byName.length + byDivision.length + byGestor.length + byZona.length + byEmail.length + byPhone.length
    };
  }

  // Formatear resultados del directorio
  formatDirectoryResults(results, query) {
    let response = '';
    
    // Resultados por nombre (prioridad si hay coincidencia exacta)
    if (results.byName.length > 0) {
      // Si solo hay 1 resultado, mostrar info completa
      if (results.byName.length === 1) {
        const contact = results.byName[0];
        response += `**👤 ${contact.Nombre}**\n\n`;
        response += `📧 **Email:** ${contact.Correo}\n`;
        response += `📞 **Teléfono:** ${contact.Contacto}\n`;
        response += `🏢 **Zona:** ${contact['Zona o cargo']}\n`;
        response += `📊 **División:** ${contact.División}\n`;
        response += `🌎 **País:** ${contact.PAIS}\n`;
        response += `👤 **Gestor:** ${contact.GESTOR}\n`;
        response += `\n📇 **Directorio completo:** Módulo 09`;
        return response;
      }
      
      // Si hay varios, mostrar lista resumida
      response += `**Encontré ${results.byName.length} contacto(s):**\n\n`;
      
      results.byName.slice(0, 8).forEach(contact => {
        response += `**${contact.Nombre}**\n`;
        response += `📞 ${contact.Contacto} • 🏢 Zona ${contact['Zona o cargo']} • 🌎 ${contact.PAIS}\n`;
        response += `📧 ${contact.Correo}\n\n`;
      });
      
      if (results.byName.length > 8) {
        response += `\n...y ${results.byName.length - 8} contacto(s) más.\n`;
      }
      
      response += `\n📇 **Ver todos:** Módulo 09`;
      return response;
    }
    
    // Resultados por zona (NUEVO)
    if (results.byZona.length > 0) {
      const zona = results.byZona[0]['Zona o cargo'];
      response += `**🏢 Zona ${zona}**\n\n`;
      response += `📊 **Total:** ${results.byZona.length} agente(s)\n\n`;
      
      results.byZona.slice(0, 10).forEach(contact => {
        response += `**${contact.Nombre}**\n`;
        response += `📞 ${contact.Contacto} • 🌎 ${contact.PAIS} - ${contact.División}\n`;
        response += `👤 Gestor: ${contact.GESTOR}\n\n`;
      });
      
      if (results.byZona.length > 10) {
        response += `\n...y ${results.byZona.length - 10} más.\n`;
      }
      
      response += `\n📇 **Ver todos:** Módulo 09`;
      return response;
    }
    
    // Resultados por país
    if (results.byCountry.length > 0) {
      const country = results.byCountry[0].PAIS;
      response += `**📍 ${country}**\n\n`;
      response += `📊 **Total:** ${results.byCountry.length} contacto(s)\n\n`;
      
      // Agrupar por gestor
      const gestores = [...new Set(results.byCountry.map(c => c.GESTOR))];
      
      response += `**Gestores (${gestores.length}):**\n`;
      gestores.forEach(gestor => {
        const contacts = results.byCountry.filter(c => c.GESTOR === gestor);
        response += `\n**${gestor}** - ${contacts.length} agente(s)\n`;
        
        // Mostrar primeros 3 contactos de cada gestor
        contacts.slice(0, 3).forEach(contact => {
          response += `  • ${contact.Nombre} - 📞 ${contact.Contacto}\n`;
        });
        
        if (contacts.length > 3) {
          response += `  ...y ${contacts.length - 3} más\n`;
        }
      });
      
      response += `\n📇 **Ver directorio completo:** Módulo 09`;
      return response;
    }
    
    // Resultados por división
    if (results.byDivision.length > 0) {
      const division = results.byDivision[0].División;
      response += `**📊 División ${division}**\n\n`;
      response += `👥 **Total:** ${results.byDivision.length} agente(s)\n`;
      response += `🌎 **País:** ${results.byDivision[0].PAIS}\n\n`;
      
      results.byDivision.slice(0, 8).forEach(contact => {
        response += `**${contact.Nombre}**\n`;
        response += `📞 ${contact.Contacto} • 🏢 Zona ${contact['Zona o cargo']}\n\n`;
      });
      
      if (results.byDivision.length > 8) {
        response += `\n...y ${results.byDivision.length - 8} más.\n`;
      }
      
      response += `\n📇 **Ver todos:** Módulo 09`;
      return response;
    }
    
    // Resultados por gestor
    if (results.byGestor.length > 0) {
      const gestor = results.byGestor[0];
      response += `**👤 Gestor: ${gestor.GESTOR}**\n\n`;
      response += `📧 ${gestor.Correo}\n`;
      response += `📞 ${gestor.Contacto}\n`;
      response += `🌎 ${gestor.PAIS}\n`;
      response += `👥 **${results.byGestor.length} agente(s)** a cargo\n\n`;
      
      response += `**Agentes:**\n`;
      results.byGestor.slice(0, 8).forEach(contact => {
        response += `• ${contact.Nombre} - 📞 ${contact.Contacto}\n`;
      });
      
      if (results.byGestor.length > 8) {
        response += `\n...y ${results.byGestor.length - 8} más.\n`;
      }
      
      response += `\n📇 **Ver directorio completo:** Módulo 09`;
      return response;
    }
    
    // Resultados por email
    if (results.byEmail.length > 0) {
      const contact = results.byEmail[0];
      response += `**📧 ${contact.Correo}**\n\n`;
      response += `👤 **Nombre:** ${contact.Nombre}\n`;
      response += `📞 **Teléfono:** ${contact.Contacto}\n`;
      response += `🏢 **Zona:** ${contact['Zona o cargo']}\n`;
      response += `🌎 **País:** ${contact.PAIS}\n`;
      response += `👤 **Gestor:** ${contact.GESTOR}\n`;
      return response;
    }
    
    // Resultados por teléfono
    if (results.byPhone.length > 0) {
      const contact = results.byPhone[0];
      response += `**📞 ${contact.Contacto}**\n\n`;
      response += `👤 **Nombre:** ${contact.Nombre}\n`;
      response += `📧 **Email:** ${contact.Correo}\n`;
      response += `🏢 **Zona:** ${contact['Zona o cargo']}\n`;
      response += `🌎 **País:** ${contact.PAIS}\n`;
      response += `👤 **Gestor:** ${contact.GESTOR}\n`;
      return response;
    }
    
    return null;
  }

  // Base de conocimiento - FAQ estática
  initKnowledgeBase() {
    this.knowledge = {
      // ===== PD / TRAMOS DE MORA =====
      'que es pd': {
        answer: `**PD significa "Past Due" (Vencido)**

Es el tiempo transcurrido desde que venció el pago de una representante. Se mide en días y determina la estrategia de cobranza.

**Ejemplo:** Si el pago vencía el 15 de enero y hoy es 25 de enero, tiene 10 días de PD.

📊 **¿Quieres ver los tramos de mora?** Pregunta: "tramos de mora"`,
        category: 'PD/Mora'
      },
      
      'tramos de mora': {
        answer: `**Tramos de Mora (PD):**

🟢 **PD0 (0 días)** - Al día / Sin mora
🟡 **Early Stage (ES): 1-45 días**
🟠 **Late Stage (LS): 46-90 días**
🔴 **Morosidad (M): 91-180 días**
⚫ **Recuperación (R): 181+ días**

💡 **Tip:** En ES usas tono preventivo, en LS más firme pero siempre profesional.

📱 **¿Quieres usar la calculadora PD?** Visita el Módulo 05 - Tramos PD`,
        category: 'PD/Mora'
      },

      'diferencia early late stage': {
        answer: `**Early Stage vs Late Stage:**

🟡 **Early Stage (ES) - 1 a 45 días:**
- Tono: Preventivo y amigable
- Objetivo: Evitar que siga creciendo
- Estrategia: Recordatorios, facilidades de pago

🟠 **Late Stage (LS) - 46 a 90 días:**
- Tono: Más firme pero profesional
- Objetivo: Recuperar antes de Morosidad
- Estrategia: Convenios, fechas límite claras

📞 **Scripts:** Pregunta "script early stage" o "script late stage"`,
        category: 'PD/Mora'
      },

      'como se calcula el pd': {
        answer: `**Cálculo del PD (Past Due):**

📅 **Fórmula:** PD = Fecha actual - Fecha de vencimiento

**Ejemplo práctico:**
- Fecha vencimiento: 10 de Enero
- Fecha actual: 28 de Enero
- **PD = 18 días** (Early Stage)

🧮 **Calculadora automática:** Módulo 05 tiene calculadora interactiva que hace esto por ti.`,
        category: 'PD/Mora'
      },

      // ===== CONVENIOS DE PAGO =====
      'que es convenio de pago': {
        answer: `**Convenio de Pago:**

Es un **acuerdo formal** entre Avon y la representante para pagar su deuda en cuotas.

**Características:**
✅ Mínimo 2 pagos
✅ Máximo 6 meses
✅ Primera cuota: mínimo 30% del total
✅ Se firma digitalmente o por escrito

📋 **Etapas:** Pregunta "etapas del convenio"`,
        category: 'Convenios'
      },

      'etapas del convenio': {
        answer: `**7 Etapas del Convenio de Pago:**

1️⃣ **Contacto inicial** - Explicar situación de mora
2️⃣ **Evaluación financiera** - Capacidad de pago
3️⃣ **Propuesta** - Número de cuotas y montos
4️⃣ **Negociación** - Ajustar según capacidad
5️⃣ **Firma del convenio** - Compromiso formal
6️⃣ **Seguimiento** - Recordatorios de cuotas
7️⃣ **Cierre** - Confirmación de cumplimiento

📄 **Detalle completo:** Módulo 03 - Convenio de Pago`,
        category: 'Convenios'
      },

      'cuantos pagos convenio': {
        answer: `**Número de Pagos en Convenio:**

📊 **Mínimo:** 2 pagos
📊 **Máximo:** Hasta 6 meses (según política país)

💰 **Primera cuota:** Mínimo 30% del total adeudado

**Ejemplo:**
- Deuda: $600
- Primera cuota: $180 mínimo (30%)
- Resto: $420 en máximo 5 cuotas

⚠️ **Importante:** Más cuotas = más riesgo de incumplimiento`,
        category: 'Convenios'
      },

      'que pasa si incumple convenio': {
        answer: `**Si la representante incumple el convenio:**

⚠️ **Consecuencias:**
1. Se cancela el convenio automáticamente
2. Deuda vuelve a estado original
3. Se pueden aplicar intereses moratorios
4. Pasa a siguiente nivel de gestión (legal)

🔄 **Opciones:**
- Renegociar un nuevo convenio (si es viable)
- Escalamiento a supervisor
- Proceso de recuperación avanzado

💡 **Prevención:** Seguimiento constante y recordatorios`,
        category: 'Convenios'
      },

      // ===== SCRIPTS Y LLAMADAS =====
      'script primera llamada': {
        answer: `**Script Primera Llamada (Early Stage):**

📞 **Apertura:**
"Hola [Nombre], buenos días/tardes. Soy [Tu nombre] del equipo de Avon. ¿Cómo estás? Te contacto porque veo que tu pago de la campaña [X] ya venció hace [Y] días."

🎯 **Desarrollo:**
"Queremos ayudarte a mantener tu cuenta al día. ¿Hay algo que podamos hacer para facilitar tu pago?"

✅ **Cierre:**
"Perfecto, entonces quedamos en que pagarás [monto] el [fecha]. Te envío confirmación por WhatsApp. ¿Te parece bien?"

📱 **Scripts completos:** Módulo 07 - Las 3 Llamadas`,
        category: 'Scripts'
      },

      'script early stage': {
        answer: `**Script Early Stage (1-45 días):**

📞 "Hola [Nombre], te habla [Tu nombre] de Avon. ¿Cómo estás?"

🎯 "Te contacto porque tu pago de la campaña [X] está pendiente desde hace [Y] días. Queremos evitar que genere intereses."

💡 "¿Cuándo podrías hacer el pago? Tenemos varias opciones..."

✅ **Cierre con compromiso concreto**

🔑 **Tono:** Amable, preventivo, colaborativo

📞 **Objeciones:** Pregunta "como manejar objecion"`,
        category: 'Scripts'
      },

      'script late stage': {
        answer: `**Script Late Stage (46-90 días):**

📞 "Hola [Nombre], soy [Tu nombre] del departamento de cobranza Avon."

⚠️ "Tu cuenta tiene [X] días de mora. Necesitamos regularizar esta situación urgentemente para evitar que pase a legal."

🎯 "Tengo autorización para ofrecerte un convenio de pago. ¿Cuánto puedes pagar hoy como primera cuota?"

✅ **Cierre firme pero profesional**

🔑 **Tono:** Serio, urgente, pero respetuoso

📋 **Convenios:** Pregunta "que es convenio de pago"`,
        category: 'Scripts'
      },

      'como manejar objecion': {
        answer: `**Manejo de Objeciones Comunes:**

💬 **"No tengo dinero"**
→ "Entiendo tu situación. ¿Qué monto sí podrías pagar esta semana? Podemos armar un convenio."

💬 **"Estoy esperando que me paguen"**
→ "Perfecto, ¿qué día recibes ese pago? Agendemos para ese día específico."

💬 **"Ya no vendo Avon"**
→ "Comprendo, pero la deuda sigue vigente. ¿Prefieres pagos pequeños mensuales o un descuento por pago total?"

💬 **"Llamo después"**
→ "Claro, ¿a qué hora te llamo mañana? Necesito agendar para dar seguimiento."

📚 **Más objeciones:** Módulo 07`,
        category: 'Scripts'
      },

      // ===== MODELO DE NEGOCIO AVON =====
      'como funciona avon': {
        answer: `**Modelo de Negocio Avon:**

1️⃣ **Representante pide productos** (a crédito)
2️⃣ **Avon entrega productos** (Día de Reparto)
3️⃣ **Representante vende** a sus clientes
4️⃣ **Fecha de vencimiento** (pagar a Avon)
5️⃣ **Representante paga** lo que debe
6️⃣ **Nuevo ciclo** (siguiente campaña)

📅 **Campaña:** Periodo de 21 días
🚚 **Reparto:** Día que recibe productos
💰 **Vencimiento:** Fecha límite de pago

🎯 **Modelo completo:** Módulo 04 - El Modelo`,
        category: 'Avon'
      },

      'que es una campaña': {
        answer: `**Campaña Avon:**

📅 Una **campaña es un periodo de 21 días** donde:
- La representante hace su pedido
- Recibe los productos
- Vende a sus clientes
- Paga a Avon

**Ejemplo:**
- Campaña 05: del 1 al 21 de Marzo
- Día de reparto: 10 de Marzo
- Fecha de vencimiento: 25 de Marzo

🔄 **Son continuas:** Cada 21 días inicia nueva campaña

📊 **Detalle:** Módulo 03 - Conoce Avon`,
        category: 'Avon'
      },

      'rendicion de cuentas': {
        answer: `**Rendición de Cuentas - 3 Niveles:**

💎 **Nivel 1: Diamante**
- Siempre paga a tiempo
- Excelente historial

💚 **Nivel 2: Esmeralda**  
- Paga con atrasos ocasionales
- Requiere seguimiento

🔴 **Nivel 3: Rubí**
- Mora constante
- Requiere gestión intensiva

🎯 **Sistema de incentivos:** Mejor nivel = mejores beneficios

📈 **Módulo completo:** Módulo 04 - El Modelo`,
        category: 'Avon'
      },

      // ===== DIRECTORIO =====
      'directorio': {
        answer: `**Directorio de Contactos:**

Para ver contactos específicos pregunta:
- "contacto costa rica"
- "contacto el salvador"
- "contacto guatemala"
- "contacto honduras"
- "contacto nicaragua"
- "contacto panama"

📇 **O visita:** Módulo 09 - Directorio completo

💡 También puedes usar el módulo "Contactos" del hub principal`,
        category: 'Directorio'
      },

      'atencion al cliente': {
        answer: `**📞 ATENCIÓN AL CLIENTE**
**Para derivar reclamos:**

🇭🇳 **Honduras:** 2263 0227
🇳🇮 **Nicaragua:** 7513 2174
🇬🇹 **Guatemala:** 2378 4861
🇸🇻 **El Salvador:** 2136 8772
🇵🇦 **Panamá:** 838 8339
🇩🇴 **República Dominicana:** 182-9946-0346

💡 **Tip:** También están en el footer de todas las páginas`,
        category: 'Directorio',
        keywords: ['reclamo', 'reclamos', 'queja', 'quejas', 'derivar', 'cliente', 'atencion']
      },

      'contacto costa rica': {
        answer: `**Gestor Costa Rica:**

📧 Email: gestor.cr@avon.com
📞 Teléfono: +506 xxxx-xxxx
🏢 División: Centroamérica Norte

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto el salvador': {
        answer: `**Gestor El Salvador:**

📧 Email: gestor.sv@avon.com
📞 Teléfono: +503 xxxx-xxxx
🏢 División: Centroamérica

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto guatemala': {
        answer: `**Gestor Guatemala:**

📧 Email: gestor.gt@avon.com
📞 Teléfono: +502 xxxx-xxxx
🏢 División: Centroamérica Norte

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto honduras': {
        answer: `**Gestor Honduras:**

📧 Email: gestor.hn@avon.com
📞 Teléfono: +504 xxxx-xxxx
🏢 División: Centroamérica Norte

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto nicaragua': {
        answer: `**Gestor Nicaragua:**

📧 Email: gestor.ni@avon.com
📞 Teléfono: +505 xxxx-xxxx
🏢 División: Centroamérica

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto panama': {
        answer: `**Gestor Panamá:**

📧 Email: gestor.pa@avon.com
📞 Teléfono: +507 xxxx-xxxx
🏢 División: Centroamérica Sur

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      'contacto panamá': {
        answer: `**Gestor Panamá:**

📧 Email: gestor.pa@avon.com
📞 Teléfono: +507 xxxx-xxxx
🏢 División: Centroamérica Sur

📇 **Directorio completo:** Módulo 09`,
        category: 'Directorio'
      },

      // ===== PUNTOS DE PAGO =====
      'puntos de pago': {
        answer: `**Puntos de Pago por País:**

Pregunta por país específico:
- "puntos de pago costa rica"
- "puntos de pago el salvador"
- "puntos de pago guatemala"
- Etc.

💳 **Módulo completo:** Módulo 06 - Puntos de Pago
Incluye selector de país interactivo con los 6 países`,
        category: 'Pagos'
      },

      // ===== PRÁCTICA Y EVALUACIÓN =====
      'como practicar': {
        answer: `**Herramientas de Práctica:**

🎮 **Quiz Interactivo**
- Evalúa tu conocimiento
- 10 preguntas
- Feedback inmediato

🎭 **Roleplay**
- Simula llamadas reales
- Practica scripts
- Mejora tu técnica

✅ **Checklist**
- Verifica que dominaste todo
- Auto-evaluación

🎯 **Accede:** Módulo 08 - Práctica`,
        category: 'Práctica'
      },

      // ===== AYUDA GENERAL =====
      'ayuda': {
        answer: `**¿En qué puedo ayudarte?**

📚 **Temas disponibles:**
- PD y tramos de mora
- Convenios de pago
- Scripts de llamadas
- Modelo de negocio Avon
- Directorio de contactos
- Puntos de pago
- Práctica y evaluación

💡 **Ejemplos de preguntas:**
- "¿Qué es PD?"
- "Etapas del convenio"
- "Script primera llamada"
- "Contacto Costa Rica"

🔍 O simplemente escribe tu duda y buscaré la respuesta`,
        category: 'General'
      },

      'menu': {
        answer: `**Módulos Disponibles:**

1️⃣ Fundamentos
2️⃣ Mentalidad
3️⃣ Conoce Avon
4️⃣ El Modelo
5️⃣ Tramos PD
6️⃣ Puntos de Pago
7️⃣ Las 3 Llamadas
8️⃣ Práctica
9️⃣ Directorio
🔟 Script Oficial

💡 Haz clic en "📚 Ver todos los módulos" o pregúntame sobre cualquier tema`,
        category: 'General'
      }
    };

    // Palabras clave para búsqueda
    this.keywords = {
      'pd': ['que es pd', 'tramos de mora', 'como se calcula el pd'],
      'mora': ['tramos de mora', 'diferencia early late stage'],
      'early stage': ['diferencia early late stage', 'script early stage'],
      'late stage': ['diferencia early late stage', 'script late stage'],
      'convenio': ['que es convenio de pago', 'etapas del convenio', 'cuantos pagos convenio'],
      'script': ['script primera llamada', 'script early stage', 'script late stage'],
      'objecion': ['como manejar objecion'],
      'avon': ['como funciona avon', 'que es una campaña'],
      'campaña': ['que es una campaña'],
      'directorio': ['directorio'],
      'contacto': ['directorio'],
      'costa rica': ['contacto costa rica'],
      'el salvador': ['contacto el salvador'],
      'guatemala': ['contacto guatemala'],
      'honduras': ['contacto honduras'],
      'nicaragua': ['contacto nicaragua'],
      'panama': ['contacto panama'],
      'panamá': ['contacto panamá'],
      'pago': ['puntos de pago', 'que es convenio de pago'],
      'practica': ['como practicar'],
      'ayuda': ['ayuda'],
      'menu': ['menu']
    };
  }

  // Crear estructura HTML del chatbot
  createChatbot() {
    const chatbotHTML = `
      <!-- Botón Flotante -->
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Abrir asistente">
        <span class="chatbot-icon">💬</span>
        <span class="chatbot-text">Ayuda</span>
      </button>

      <!-- Panel de Chat -->
      <div id="chatbot-panel" class="chatbot-panel">
        <div class="chatbot-header">
          <div class="chatbot-header-content">
            <div class="chatbot-avatar">🤖</div>
            <div class="chatbot-title">
              <h3>Asistente Avon</h3>
              <p>Preguntas frecuentes</p>
            </div>
          </div>
          <button id="chatbot-close" class="chatbot-close" aria-label="Cerrar">✕</button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Mensaje de bienvenida -->
          <div class="chatbot-message bot-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <p><strong>¡Hola! Soy tu asistente virtual.</strong></p>
              <p>Pregúntame sobre:</p>
              <ul>
                <li>🔴 Tramos de mora (PD)</li>
                <li>📋 Convenios de pago</li>
                <li>📞 Scripts de llamadas</li>
                <li>📇 Contactos del equipo</li>
                <li>💰 Puntos de pago</li>
              </ul>
              <p style="margin-top: 10px; font-size: 13px; opacity: 0.8;">💡 <em>Tip: Escribe "ayuda" para ver más opciones</em></p>
            </div>
          </div>
        </div>

        <div class="chatbot-quick-actions" id="chatbot-quick-actions">
          <button class="quick-btn" data-question="que es pd">¿Qué es PD?</button>
          <button class="quick-btn" data-question="tramos de mora">Tramos de mora</button>
          <button class="quick-btn" data-question="script primera llamada">Script 1ra llamada</button>
          <button class="quick-btn" data-question="directorio">📇 Directorio</button>
        </div>

        <div class="chatbot-input-wrapper">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chatbot-input" 
            placeholder="Escribe tu pregunta..."
            autocomplete="off"
          />
          <button id="chatbot-send" class="chatbot-send" aria-label="Enviar">
            <span>→</span>
          </button>
        </div>

        <div class="chatbot-footer">
          <span>💯 100% Gratis • Sin APIs de pago</span>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  // Event listeners
  attachEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const quickBtns = document.querySelectorAll('.quick-btn');

    toggle.addEventListener('click', () => this.openChat());
    close.addEventListener('click', () => this.closeChat());
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        this.askQuestion(question);
      });
    });
  }

  // Abrir chat
  openChat() {
    const panel = document.getElementById('chatbot-panel');
    const toggle = document.getElementById('chatbot-toggle');
    panel.classList.add('open');
    toggle.classList.add('hidden');
    this.isOpen = true;
    
    // Focus en input
    setTimeout(() => {
      document.getElementById('chatbot-input').focus();
    }, 300);
  }

  // Cerrar chat
  closeChat() {
    const panel = document.getElementById('chatbot-panel');
    const toggle = document.getElementById('chatbot-toggle');
    panel.classList.remove('open');
    toggle.classList.remove('hidden');
    this.isOpen = false;
  }

  // Enviar mensaje
  sendMessage() {
    const input = document.getElementById('chatbot-input');
    const question = input.value.trim().toLowerCase();
    
    if (!question) return;

    this.addUserMessage(question);
    input.value = '';
    
    setTimeout(() => {
      this.processQuestion(question);
    }, 500);
  }

  // Hacer pregunta desde botón rápido
  askQuestion(key) {
    this.addUserMessage(this.formatQuestion(key));
    setTimeout(() => {
      this.processQuestion(key);
    }, 500);
  }

  // Formatear pregunta para mostrar
  formatQuestion(key) {
    const formatted = {
      'que es pd': '¿Qué es PD?',
      'tramos de mora': 'Tramos de mora',
      'script primera llamada': 'Script primera llamada',
      'directorio': 'Ver directorio'
    };
    return formatted[key] || key;
  }

  // Procesar pregunta
  processQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Buscar respuesta exacta
    if (this.knowledge[lowerQuestion]) {
      this.addBotMessage(this.knowledge[lowerQuestion].answer);
      this.trackQuestion(lowerQuestion, this.knowledge[lowerQuestion].category);
      return;
    }

    // Buscar en directorio si la pregunta incluye palabras de contacto
    const contactKeywords = ['contacto', 'gestor', 'telefono', 'teléfono', 'email', 'correo', 
                            'guatemala', 'el salvador', 'costa rica', 'honduras', 'nicaragua', 
                            'panama', 'panamá', 'republica dominicana', 'dominicana',
                            'zona', 'division', 'división', 'agente', 'ceiba', 'conacaste',
                            'caoba', 'teca', 'aguila', 'fenix', 'liquidambar', 'cedro',
                            'glenda', 'oliver', 'santos'];
    
    if (contactKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      const results = this.searchDirectory(lowerQuestion);
      
      if (results && results.total > 0) {
        const formattedResults = this.formatDirectoryResults(results, lowerQuestion);
        if (formattedResults) {
          this.addBotMessage(formattedResults);
          this.trackQuestion('directorio_search', 'Directorio');
          return;
        }
      }
    }

    // Buscar por palabras clave (FAQ estática)
    for (const [keyword, possibleAnswers] of Object.entries(this.keywords)) {
      if (lowerQuestion.includes(keyword)) {
        const answerKey = possibleAnswers[0];
        this.addBotMessage(this.knowledge[answerKey].answer);
        this.trackQuestion(answerKey, this.knowledge[answerKey].category);
        return;
      }
    }

    // No se encontró respuesta
    this.addBotMessage(`🤔 No encontré una respuesta exacta para "${question}".

**Sugerencias:**
- Intenta reformular tu pregunta
- Escribe "ayuda" para ver temas disponibles
- Usa los botones rápidos abajo
- O navega a los módulos desde el menú lateral

💡 **Preguntas frecuentes:**
• ¿Qué es PD?
• Tramos de mora
• Etapas del convenio
• Script primera llamada
• Contacto [país]`);
  }

  // Agregar mensaje de usuario
  addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageHTML = `
      <div class="chatbot-message user-message">
        <div class="message-content">
          <p>${this.escapeHTML(text)}</p>
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
  }

  // Agregar mensaje del bot
  addBotMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageHTML = `
      <div class="chatbot-message bot-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          ${this.formatMessage(text)}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
  }

  // Formatear mensaje (convertir markdown simple)
  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p>$1</p>');
  }

  // Escape HTML
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Scroll al final
  scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Sistema de métricas (local)
  trackMetrics() {
    if (!localStorage.getItem('chatbot-metrics')) {
      localStorage.setItem('chatbot-metrics', JSON.stringify({
        totalQuestions: 0,
        questionsByCategory: {},
        topQuestions: {},
        sessions: 0
      }));
    }
    
    // Nueva sesión
    const metrics = JSON.parse(localStorage.getItem('chatbot-metrics'));
    metrics.sessions++;
    localStorage.setItem('chatbot-metrics', JSON.stringify(metrics));
  }

  // Trackear pregunta
  trackQuestion(question, category) {
    const metrics = JSON.parse(localStorage.getItem('chatbot-metrics'));
    
    metrics.totalQuestions++;
    
    if (!metrics.questionsByCategory[category]) {
      metrics.questionsByCategory[category] = 0;
    }
    metrics.questionsByCategory[category]++;
    
    if (!metrics.topQuestions[question]) {
      metrics.topQuestions[question] = 0;
    }
    metrics.topQuestions[question]++;
    
    localStorage.setItem('chatbot-metrics', JSON.stringify(metrics));
  }
}

// Inicializar chatbot cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
  new AvonChatbot();
});
