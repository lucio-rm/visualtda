# VISUAL TDA — MASTER PRODUCT, UX & PEDAGOGICAL AUDIT MISSION V5

## 0. DIRECTIVA PRINCIPAL

Sos el PRIMARY ORCHESTRATOR de Visual TDA.

Esta misión NO reemplaza la filosofía arquitectónica anterior. La extiende.

La situación actual cambió:

El proyecto ya tiene una cantidad considerable de infraestructura, ejercicios, visualizadores, playgrounds, trazas, tests, ejecución Python, i18n, temas, etc.

Ahora el problema principal NO es:

> "¿Podemos implementar otra feature?"

El problema principal es:

> "¿La página realmente funciona como una excelente herramienta universitaria para aprender Teoría y Diseño de Algoritmos?"

La respuesta todavía no es suficientemente buena.

Por lo tanto:

# DEJÁ DE MEDIR EL PROGRESO PRINCIPALMENTE EN CANTIDAD DE FEATURES.

Ahora tenés que medirlo en:

* calidad pedagógica
* claridad visual
* calidad de interacción
* calidad de los gráficos
* calidad de navegación
* legibilidad
* jerarquía visual
* comprensión del algoritmo
* capacidad de experimentación
* calidad de ejemplos
* coherencia entre problema, algoritmo y visualización
* calidad de la interfaz
* consistencia ES/EN
* calidad del light mode
* uso inteligente del espacio
* feedback al estudiante
* profundidad real de cada ejercicio
* capacidad del estudiante de aprender algo nuevo
* capacidad de la aplicación de explicar POR QUÉ
* ausencia de bugs
* ausencia de estados confusos
* ausencia de features que existen solamente "porque están implementadas"

---

# 1. EL PROBLEMA MÁS IMPORTANTE QUE TENEMOS AHORA

El proyecto puede tener:

37 ejercicios.

37 visualizadores.

37 playgrounds.

256 tests.

Chromium PASS.

Build PASS.

Lint PASS.

Typecheck PASS.

Y aun así ser una página mediocre.

Eso ya quedó demostrado conceptualmente.

El hecho de que Antigravity haya reportado:

> "100% de cobertura de visualizadores y playgrounds"

no significa:

> "100% de calidad visual y pedagógica".

Un componente SVG que renderiza correctamente puede ser:

* feo
* pequeño
* confuso
* mal proporcionado
* poco interactivo
* conceptualmente incorrecto
* demasiado cargado
* demasiado vacío
* imposible de leer
* inútil pedagógicamente

Por lo tanto:

# NO CONFUNDAS EXISTENCIA CON CALIDAD.

Y:

# NO CONFUNDAS PASS CON BUEN PRODUCTO.

---

# 2. CAMBIO DE MODO: PRODUCT AUDITOR

A partir de ahora, antes de implementar grandes cantidades de código, actuá como:

* diseñador de producto
* diseñador de interacción
* diseñador visual
* diseñador de información
* diseñador pedagógico
* profesor universitario
* estudiante universitario
* ingeniero frontend
* QA manual
* QA automatizado
* arquitecto

No quiero que solamente leas archivos.

Quiero que USES LA PÁGINA.

---

# 3. PRIMERA OBLIGACIÓN: ABRIR LA PÁGINA REAL

Antes de continuar desarrollando:

1. arrancá el servidor;
2. abrí Visual TDA en Chromium;
3. recorré realmente la interfaz;
4. hacé clic;
5. cambiá ejercicios;
6. cambiá idioma;
7. cambiá tema;
8. probá Discover;
9. probá Solve;
10. probá Understand;
11. probá playgrounds;
12. probá visualizadores;
13. intentá equivocarte;
14. intentá introducir datos inválidos;
15. intentá usar ejemplos propios;
16. navegá hacia atrás y adelante;
17. probá ejercicios recomendados;
18. observá qué ocurre después de completar algo;
19. mirá el catálogo;
20. mirá las páginas con ojos de estudiante.

NO TE LIMITES A:

```text
npm test
npm run build
npm run lint
```

Esos comandos no pueden detectar:

> "Este gráfico es una porquería."

---

# 4. HACÉ UNA AUDITORÍA HUMANA REAL

Quiero una auditoría visual y de UX documentada.

Crear:

`docs/product-ux-audit.md`

Y registrar:

* problema
* pantalla
* ejercicio
* severidad
* evidencia
* impacto pedagógico
* impacto UX
* solución propuesta
* solución implementada
* estado de verificación

Usá categorías:

### P0

Rompe el uso o genera información incorrecta.

### P1

Daña seriamente el aprendizaje o la interacción.

### P2

Problema importante de UX/pedagogía.

### P3

Problema visual o de refinamiento.

### P4

Detalle menor.

NO uses "todo está bien" como conclusión simplemente porque no encontraste errores de runtime.

---

# 5. HACÉ UNA AUDITORÍA COMO ESTUDIANTE

Imaginá que soy un estudiante universitario que entra por primera vez.

Quiero poder responder naturalmente:

* ¿Dónde estoy?
* ¿Qué estoy aprendiendo?
* ¿Qué tengo que hacer ahora?
* ¿Por qué estoy viendo este gráfico?
* ¿Qué significa esta palabra?
* ¿Qué puedo tocar?
* ¿Qué puedo cambiar?
* ¿Qué acaba de pasar?
* ¿Por qué pasó?
* ¿Qué debería intentar ahora?
* ¿Estoy explorando o resolviendo?
* ¿Estoy haciendo progreso?
* ¿Cómo vuelvo a lo anterior?
* ¿Dónde está mi ejercicio?
* ¿Por qué me recomendaron este ejercicio?
* ¿Por qué al hacer clic en la recomendación no fui directamente al lugar correspondiente?

Si alguna respuesta no resulta evidente:

# TENEMOS UN PROBLEMA DE UX.

---

# 6. NO HAGAS PREGUNTAS AL USUARIO PARA DECISIONES NORMALES

Tenés autonomía.

Si encontrás:

* un layout malo
* una mala jerarquía
* un color incorrecto
* una visualización insuficiente
* un flujo confuso
* una navegación incoherente
* una traducción incorrecta
* un espacio desperdiciado
* un componente demasiado grande
* una palabra demasiado técnica sin explicación

tomá una decisión razonable y corregilo.

No esperes aprobación.

---

# 7. DISEÑO GENERAL: VISUAL TDA NO DEBE PARECER UN PROTOTIPO

El resultado debe sentirse como:

> una herramienta universitaria moderna para aprender algoritmos.

No como:

* dashboard administrativo
* proyecto universitario genérico
* colección de tarjetas
* demo técnica
* playground de programación
* página infantil
* template SaaS
* muro de componentes

El estudiante debería sentir que existe una estructura intelectual detrás del sitio.

---

# 8. REDISEÑÁ LA ARQUITECTURA VISUAL DEL CATÁLOGO

El usuario detectó específicamente que:

* Backtracking aparece demasiado pronto;
* la separación principal no resulta natural;
* la interfaz principal no tiene buena jerarquía;
* el catálogo puede sentirse como una pared de ejercicios.

No aceptes eso.

Revisá completamente:

* Home
* catálogo
* navegación por paradigmas
* orden
* categorías
* tarjetas
* filtros
* recomendaciones
* progreso
* ejercicios recientes
* ejercicios sugeridos

No necesariamente hay que eliminar categorías.

Hay que construir una jerarquía que tenga sentido pedagógico.

---

# 9. NO PONGAS BACKTRACKING PRIMERO PORQUE SÍ

La organización del catálogo debe reflejar progresión conceptual.

Analizá cuidadosamente:

* Divide & Conquer
* Greedy
* Dynamic Programming
* Backtracking
* Branch & Bound
* Graph algorithms
* Flow
* Reductions
* Approximation
* Randomized algorithms
* Linear Programming

El orden debe responder a una lógica educativa.

No a:

> "la categoría que primero agregamos".

Documentá la decisión.

---

# 10. EL CATÁLOGO NO DEBE SER UNA PARED

La pantalla principal necesita:

* jerarquía
* agrupación
* respiración
* orientación
* búsqueda
* filtros razonables
* progreso
* continuación
* recomendaciones

Pero NO la llenes de:

* cards gigantes
* sombras excesivas
* badges inútiles
* información repetida
* párrafos enormes

Quiero que el estudiante pueda escanear la página rápidamente.

---

# 11. RECOMENDACIONES DE EJERCICIOS

Existe un problema concreto:

La página recomienda un ejercicio, pero la recomendación no necesariamente lleva al estudiante a la fase correcta.

Eso es una incoherencia.

Si la interfaz dice:

> "Te recomendamos practicar X"

el CTA debe llevar a:

> X

y, si existe una intención pedagógica específica:

> X en la fase correspondiente.

No:

> X abierto en un lugar arbitrario que obliga al estudiante a buscar qué hacer.

Auditá TODAS las recomendaciones.

---

# 12. LAS FASES TIENEN QUE SER INTELIGIBLES

La estructura:

* Discover
* Solve
* Understand

puede funcionar.

Pero preguntate:

¿Un estudiante entiende inmediatamente qué significa cada una?

Si no:

mejorá:

* nombres
* subtítulos
* iconografía
* descripción
* orden
* navegación
* indicadores de progreso

No cambies nombres arbitrariamente.

Evaluá primero qué comunica cada uno.

---

# 13. DISCOVER DEBE SER UNA EXPERIENCIA

Discover no debe ser:

> texto + gráfico + botón.

Debe permitir:

> observar → manipular → experimentar → formular hipótesis.

Siempre que el problema lo permita.

---

# 14. PERSONALIZACIÓN: "CASO PROPIO"

Esto es una prioridad.

Para cada ejercicio donde tenga sentido, agregá una forma de:

> Caso propio

o equivalente.

El estudiante debería poder cambiar, según el problema:

* tamaño
* valores
* pesos
* capacidad
* puntos
* aristas
* vértices
* tareas
* deadlines
* frecuencias
* secuencias
* parámetros
* grafos
* restricciones

Y después:

> ejecutar / explorar / observar.

No construyas 37 sistemas diferentes.

Diseñá infraestructura reusable solamente donde haya una estructura común real.

---

# 15. PERSONALIZAR NO SIGNIFICA SOLAMENTE EDITAR UN INPUT

El ejemplo personalizado debe atravesar todo el sistema:

```text
input
 ↓
algorithm
 ↓
trace
 ↓
visualizer
 ↓
metrics
 ↓
educational explanation
```

Si cambio el input:

el gráfico debe cambiar.

La traza debe cambiar.

Los estados deben cambiar.

Los resultados deben cambiar.

No puede existir una visualización hardcodeada que solamente finge reaccionar.

---

# 16. LOS GRÁFICOS ACTUALES NECESITAN UNA AUDITORÍA BRUTAL

No quiero que digas:

> "Tiene un SVG."

Quiero:

> "¿Este SVG enseña?"

Para CADA visualizador preguntá:

### Escala

¿Se ve suficientemente grande?

### Proporción

¿Usa correctamente el espacio?

### Legibilidad

¿Se entienden nodos, textos, líneas y estados?

### Interacción

¿Se puede:

* arrastrar?
* seleccionar?
* hacer zoom?
* modificar?
* avanzar?
* retroceder?
* inspeccionar?

cuando tenga sentido?

### Estado

¿Se entiende qué está pasando?

### Causalidad

¿Se entiende qué acción del algoritmo provocó el cambio?

### Comparación

¿Se puede comparar el estado anterior con el actual?

### Personalización

¿Funciona con inputs propios?

### Responsive

¿Sigue siendo legible?

---

# 17. NO TODOS LOS GRÁFICOS DEBEN SER INTERACTIVOS

No agregues drag & drop porque sí.

Para cada ejercicio decidí:

* interacción necesaria
* interacción útil
* interacción innecesaria

Pero si un gráfico representa una estructura naturalmente manipulable:

la interacción debe considerarse seriamente.

---

# 18. DRAG & DROP

Revisá dónde realmente aporta.

Ejemplos:

### Scheduling

Mover intervalos.

### Huffman

Manipular nodos o merges cuando tenga sentido.

### Knapsack

Mover/seleccionar objetos.

### Graph algorithms

Mover nodos.

### Points

Mover puntos.

### LP

Mover restricciones o explorar región si es pedagógicamente correcto.

No implementes interacción gimmick.

Cada interacción debe responder:

> "¿Qué concepto aprende el estudiante gracias a esto?"

---

# 19. TAMAÑO DE LAS VISUALIZACIONES

Hay un problema actual de escala.

Muchos visualizadores desperdician espacio alrededor o comprimen demasiado el gráfico.

Revisá:

* ancho máximo
* alto mínimo
* aspect ratio
* panel lateral
* timeline
* controles
* labels
* leyenda

No uses:

```css
width: 100%;
```

como sustituto de diseño.

El gráfico tiene que tener una composición deliberada.

---

# 20. NO HAGAS COLUMNAS INFINITAS

Problema detectado:

La página utiliza columnas demasiado largas y estrechas.

Eso hace que el estudiante se pierda.

Revisá:

* max-width
* ancho de lectura
* columnas
* grids
* paneles
* densidad
* separación vertical

En pantallas de escritorio:

aprovechá el ancho horizontal.

No conviertas un monitor de 1920px en una página de 650px de ancho con toneladas de scroll vertical.

---

# 21. DISEÑÁ POR "ZONAS DE ATENCIÓN"

Especialmente en ejercicios.

Una composición posible:

```text
┌──────────────────────────────────────────────────────────────┐
│ Contexto / objetivo                                         │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│ Visualización                │ Estado / explicación          │
│                              │                               │
│                              │                               │
├──────────────────────────────┴───────────────────────────────┤
│ Controles / timeline / interacción                          │
└──────────────────────────────────────────────────────────────┘
```

Pero NO copies este layout mecánicamente.

Cada ejercicio necesita su propia composición.

---

# 22. KNAPSACK: CASO EMBLEMÁTICO

El usuario planteó una pregunta muy importante:

> "Si en el problema de la mochila no hay una puta mochila, ¿de qué te sirve?"

La frase es informal, pero la crítica es técnicamente correcta.

Si el problema conceptual es una mochila:

el estudiante debería poder reconocer visualmente:

* objetos
* peso
* valor
* capacidad
* selección
* espacio utilizado
* valor acumulado

La representación debe ayudar a construir el modelo mental.

No quiero:

```text
Item 1 | 4 | 10
Item 2 | 2 | 8
```

como única experiencia visual.

Quiero una representación que permita entender:

> "Tengo una capacidad limitada y estoy decidiendo qué objetos entran."

Para Knapsack:

diseñá una visualización pedagógica específica.

Debe permitir comparar, cuando corresponda:

* selección Greedy
* solución DP
* solución Branch & Bound

y mostrar claramente que:

> es el mismo problema con técnicas diferentes.

---

# 23. KNAPSACK DP

La visualización debe permitir observar:

```text
        capacidad →
items
↓
┌─────────────────────────────┐
│      DP table               │
│                             │
│      construcción           │
│          ↓                  │
│       transición            │
│          ↓                  │
│     reconstrucción          │
└─────────────────────────────┘
```

El estudiante debe entender:

* qué representa cada celda
* qué subproblema representa
* qué celdas se consultan
* por qué se toma una decisión
* cómo se reconstruye la respuesta

No mostrar solamente una matriz final.

---

# 24. HUFFMAN

Huffman merece una visualización excelente.

Mostrar:

```text
frecuencia
   ↓
nodos
   ↓
selección de mínimos
   ↓
merge
   ↓
bosque
   ↓
árbol
   ↓
códigos
   ↓
codificación
```

La interacción debe ayudar a entender POR QUÉ se eligen los dos mínimos.

No solamente animar un árbol.

---

# 25. N-QUEENS

Debe permitir estados inválidos.

Esto es importante.

El estudiante debe poder colocar:

* dos reinas en la misma fila
* dos en la misma columna
* dos en la misma diagonal

y el sistema debe explicar:

* qué reina ataca a cuál
* qué restricción se viola
* por qué
* cómo Backtracking detectaría el conflicto

No bloquees la interacción simplemente para mantener el tablero "correcto".

Los errores son parte de la enseñanza.

---

# 26. BACKTRACKING: MOSTRAR LA DIFERENCIA REAL

No alcanza con:

> "Backtracking"

y una animación.

El estudiante debería poder observar algo como:

```text
Brute Force
████████████████████

Backtracking
██████████

Backtracking + heurística
██████
```

cuando la comparación tenga sentido.

Y mejor aún:

mostrar métricas reales:

* estados explorados
* ramas descartadas
* profundidad máxima
* tiempo
* soluciones encontradas
* poda aplicada

No inventes métricas.

Deben surgir de la ejecución.

---

# 27. "¿QUÉ PASA SI AUMENTO N?"

Esta es una feature pedagógica excelente cuando el problema lo permite.

Por ejemplo:

```text
N = 4
N = 5
N = 6
N = 7
N = 8
```

Mostrar:

* estados
* tiempo
* profundidad
* memoria si puede medirse razonablemente

y visualizar la evolución.

Objetivo:

que el estudiante OBSERVE el crecimiento de la complejidad.

No solamente leer:

> O(2^n)

---

# 28. BACKTRACKING Y GREEDY NECESITAN "SENTIRSE"

Un estudiante debería poder experimentar:

> "Este algoritmo explora."

> "Este algoritmo descarta."

> "Este greedy toma una decisión local."

> "Esta decisión local puede llevar a una solución global óptima."

> "Acá greedy falla."

> "Acá una estrategia diferente funciona."

La interfaz tiene que hacer visible esa diferencia.

---

# 29. COMPARACIÓN DE ALGORITMOS

Diseñá una experiencia reutilizable para comparar técnicas cuando sea pedagógicamente válida.

Ejemplo:

## N-Queens

```text
Método              Estados       Tiempo
Brute Force         256           ...
Backtracking        42            ...
Backtracking + ...  17            ...
```

Pero no muestres tablas sin contexto.

Debe explicarse:

> qué representa cada métrica

y:

> por qué cambia.

No convertir esto en un leaderboard.

Es una herramienta de comprensión.

---

# 30. VIDEOS / DIAPOSITIVAS / PRESENTACIONES FINALES

Actualmente las secuencias finales no comunican suficientemente:

* cuánto tarda
* qué hace realmente el algoritmo
* cómo crece
* cómo se comporta frente a otra estrategia
* qué decisiones toma

Revisá completamente esa experiencia.

Cuando tenga sentido, una demostración debe mostrar:

```text
input
 ↓
estado inicial
 ↓
pasos
 ↓
decisiones
 ↓
resultado
 ↓
métricas
```

Y no solamente:

> "Play animation."

---

# 31. EL TIEMPO TIENE QUE SER VISIBLE CUANDO SEA ÚTIL

Cuando se mide tiempo:

mostralo con honestidad.

Por ejemplo:

```text
Tiempo de ejecución
12.4 ms
```

Pero explicá que:

* el navegador
* el hardware
* el tamaño del input
* Pyodide
* JIT/WASM
* carga inicial

pueden afectar la medición.

No presentes microbenchmarks como verdades universales.

---

# 32. COMPLEJIDAD: CONECTAR TEORÍA CON EXPERIMENTO

Si el algoritmo dice:

```text
O(n log n)
```

el estudiante debería poder observar:

* crecimiento del input
* cantidad de pasos
* tiempo aproximado
* estados

cuando sea técnicamente válido.

La interfaz debe conectar:

```text
teoría
   ↕
experimento
```

---

# 33. LIGHT MODE: NO PUEDE SER UN AFTERTHOUGHT

El usuario reportó que en Light:

> "no se ve bien nada."

Eso es P1/P2 dependiendo de la pantalla.

No aceptes:

```css
background: white;
color: black;
```

como solución.

Auditar:

* contraste
* cards
* bordes
* SVG
* estados
* texto secundario
* código
* tablas
* timeline
* nodos
* grafos
* badges
* sliders
* focus
* hover
* disabled
* error
* success

Light y Dark deben ser dos temas deliberadamente diseñados.

No:

> dark theme + invertí colores.

---

# 34. DESIGN TOKENS

Revisá el sistema de diseño.

Necesitamos tokens coherentes para:

* background
* surface
* surface elevated
* text
* text muted
* border
* accent
* success
* warning
* error
* info
* graph colors
* algorithm states

Los colores deben tener significado consistente.

Por ejemplo:

un color que representa "seleccionado" no debería representar "error" en otro ejercicio.

---

# 35. COLORES DE LOS GRÁFICOS

Los colores de los visualizadores necesitan semántica.

No elijas colores porque "quedan lindos".

Documentá:

```text
normal
active
candidate
selected
rejected
conflict
solution
visited
pruned
current
```

Y verificá contraste en:

* light
* dark

---

# 36. GRÁFICOS NO PUEDEN DEPENDER EXCLUSIVAMENTE DEL COLOR

Si algo está en conflicto:

además del color:

* patrón
* borde
* icono
* etiqueta
* animación controlada
* texto

cuando sea necesario.

---

# 37. INTERFAZ EN INGLÉS DEBE ESTAR REALMENTE EN INGLÉS

El usuario detectó mezcla de idiomas.

Esto es un bug de producto.

Auditá:

* botones
* títulos
* tooltips
* mensajes
* errores
* estados
* placeholders
* navegación
* accesibilidad
* visualizadores
* playgrounds
* textos dinámicos

No alcanza con traducir el header.

---

# 38. TERMINOLOGÍA TÉCNICA

No asumas que el estudiante conoce absolutamente todo.

Pero tampoco infantilices la interfaz.

La solución debe ser:

## término técnico + explicación contextual

Ejemplo:

> Heurística

y permitir:

> una pequeña explicación contextual al pasar, enfocar o seleccionar.

Ejemplo:

> **Heurística:** estrategia que puede ayudar a encontrar buenas soluciones más rápido, pero no necesariamente garantiza una solución óptima.

No conviertas toda palabra técnica en un tooltip.

Usá explicación contextual cuando realmente ayude.

---

# 39. ¿QUÉ DEBE ESTAR EXPLICADO Y QUÉ PUEDE ASUMIRSE?

Definí una política.

### Puede asumirse

Conceptos básicos de programación y matemática universitaria.

### Debe explicarse

Conceptos propios del tema o términos que sean nuevos dentro del contexto.

### Debe vincularse

Conceptos que el estudiante probablemente conozca pero que aquí adquieren un significado algorítmico específico.

Documentá la política en:

`docs/pedagogical-language-guide.md`

---

# 40. NO UTILICES "HEURÍSTICA" SIN CONTEXTO SI ES IMPORTANTE PARA EL EJERCICIO

Si aparece por primera vez:

hacé que el estudiante pueda descubrir qué significa.

Pero NO llenes cada pantalla de tooltips.

La interfaz debe enseñar sin convertirse en un diccionario flotante.

---

# 41. EJEMPLOS: AUDITARLOS TODOS

Esto es importantísimo.

El usuario detectó:

> "muy tosco todo."

Los ejemplos son parte del contenido pedagógico.

No uses ejemplos arbitrarios.

Cada ejemplo debe tener una razón.

Preguntá:

* ¿Es fácil de visualizar?
* ¿Tiene suficiente complejidad?
* ¿Produce un caso interesante?
* ¿Muestra el concepto?
* ¿Permite ver una diferencia?
* ¿Tiene un contraejemplo útil?
* ¿Es demasiado grande?
* ¿Es demasiado trivial?

---

# 42. CADA EJERCICIO DEBE TENER AL MENOS UN EJEMPLO "DIDÁCTICO"

No necesariamente el más realista.

Debe ser el que mejor explica el concepto.

Además, cuando tenga sentido:

* ejemplo simple
* ejemplo desafiante
* contraejemplo
* caso borde
* caso propio

---

# 43. CONTRAEJEMPLOS

Son fundamentales.

Especialmente para:

* Greedy
* aproximación
* backtracking
* branch & bound
* reducciones

No enseñes solamente cuando algo funciona.

Mostrá cuándo NO funciona.

---

# 44. GREEDY NECESITA CONTRAEJEMPLOS

Para cada algoritmo Greedy donde corresponda:

mostrar:

```text
estrategia local
↓
decisión
↓
consecuencia
```

Y cuando exista:

```text
contraejemplo
```

La idea no es decir:

> "Greedy es malo."

La idea es enseñar:

> cuándo la estrategia tiene una propiedad que permite garantizar optimalidad y cuándo no.

---

# 45. VISUALIZACIÓN ESPECÍFICA POR PROBLEMA

NO diseñes visualizadores genéricos que solamente cambien colores.

El gráfico debe surgir del modelo mental del problema.

Ejemplos:

### Knapsack

mochila + objetos + peso + valor.

### Scheduling

timeline + tareas + deadlines.

### Dijkstra

grafo + distancias + relajaciones.

### Kruskal

aristas + componentes + ciclo.

### Huffman

frecuencias + bosque + árbol.

### Closest Pair

puntos + divisiones + strip.

### LP

restricciones + región factible + objetivo.

### DP

tabla + dependencias + reconstrucción.

### Backtracking

árbol de búsqueda + decisiones + poda.

---

# 46. NO TODO NECESITA 3D

No agregues 3D por marketing.

La pregunta correcta es:

> ¿La tercera dimensión ayuda a entender algo que 2D no comunica bien?

Si NO:

2D.

Y un 2D excelente es preferible a un 3D mediocre.

---

# 47. ¿CUÁNDO USAR IMÁGENES 2D?

Sí, pueden ser útiles.

Pero diferenciá:

### Ilustración conceptual

Ayuda a explicar el problema antes de interactuar.

### Visualización algorítmica

Representa estados reales de la ejecución.

### Decoración

No aporta aprendizaje.

No confundas las tres.

Usá imágenes/ilustraciones 2D cuando mejoren la introducción conceptual.

No pegues imágenes externas solamente para llenar espacio.

---

# 48. SVG / CANVAS / HTML

Elegí la tecnología según el problema.

### SVG

Excelente para:

* grafos
* árboles
* timelines
* puntos
* tablas visuales
* diagramas
* interacción precisa

### Canvas

Puede ser apropiado cuando:

* hay muchísimos elementos
* animaciones intensivas
* rendering continuo

### HTML/CSS

Excelente para:

* tablas
* listas
* paneles
* controles
* árboles simples
* matrices

No uses SVG porque "todos usan SVG".

Usalo cuando corresponda.

---

# 49. ARRASTRAR ELEMENTOS

Evaluá ejercicio por ejercicio.

Si un punto representa una coordenada:

arrastrarlo tiene sentido.

Si un nodo de un grafo puede moverse:

puede tener sentido.

Si una tarea puede cambiar de posición:

puede tener sentido.

Si arrastrar un elemento no enseña nada:

no lo agregues.

---

# 50. TIMELINE DE EJECUCIÓN

La timeline debe ser realmente útil.

Necesita:

* play
* pause
* step forward
* step backward
* reset
* velocidad
* indicador de paso
* descripción del estado actual

Cuando sea útil:

```text
Paso 17 / 83
```

y:

> "Se relajó la arista A → B."

No:

> "Paso 17."

---

# 51. EXPLICAR CADA PASO

Cuando el estudiante avanza:

debe poder responder:

> ¿qué cambió?

y:

> ¿por qué cambió?

No hace falta texto enorme.

Una explicación de una línea puede ser suficiente.

---

# 52. REPLAY

El estudiante debería poder repetir una ejecución sin tener que recargar toda la página.

---

# 53. VELOCIDAD

Permitir controlar:

* lento
* normal
* rápido

cuando la animación lo permita.

Pero no hagas que la velocidad destruya la comprensión.

---

# 54. PAUSA AUTOMÁTICA EN MOMENTOS IMPORTANTES

Para algunas visualizaciones:

podés pausar automáticamente cuando ocurre algo conceptualmente importante.

Ejemplos:

* selección de pivote
* conflicto
* poda
* relajación
* merge
* nueva mejor solución
* reconstrucción

No abusar.

---

# 55. NO ANIMAR POR ANIMAR

La animación debe responder a:

> "¿Qué cambio algorítmico estoy haciendo visible?"

Si no existe una respuesta:

el movimiento probablemente sobra.

---

# 56. ESPACIO EN PANTALLA

Quiero que optimices el diseño para:

* notebook
* desktop
* 1366×768
* 1440×900
* 1920×1080

No optimices primero para mobile.

Pero NO rompas mobile.

---

# 57. BREAKPOINTS

Probá explícitamente:

* 1280
* 1366
* 1440
* 1920

y al menos un viewport pequeño para evitar regresiones graves.

---

# 58. EVITAR SCROLL INNECESARIO

Si el estudiante tiene que:

scroll → leer → scroll → encontrar botón → scroll → volver

la composición está mal.

Agrupá información relacionada.

---

# 59. NAVEGACIÓN DENTRO DEL EJERCICIO

Debe ser evidente:

```text
← volver al catálogo

Ejercicio
├── Descubrir
├── Resolver
└── Comprender
```

Y el estado actual debe ser claro.

---

# 60. NO OBLIGUES AL ESTUDIANTE A RECORDAR CONTEXTO

Si Resolve necesita información que apareció en Discover:

permití volver a consultarla.

Si Understand menciona un concepto que apareció en Discover:

vinculalo.

No obligues al estudiante a abrir otra pestaña mentalmente.

---

# 61. CROSS-LINKING PEDAGÓGICO

Cuando dos ejercicios están relacionados:

mostralo.

Ejemplo:

Knapsack:

> También podés estudiar este problema con:
> Greedy
> Dynamic Programming
> Branch & Bound

Eso refuerza:

> problema ≠ técnica.

---

# 62. COMPARACIÓN ENTRE TÉCNICAS

Cuando sea realmente útil:

permití comparar:

* idea
* garantías
* complejidad
* comportamiento
* estados explorados
* ejemplos donde difieren

No hagas rankings.

No hagas "mejor algoritmo".

Mostrá diferencias.

---

# 63. RECOMENDACIONES PEDAGÓGICAS

No recomendar:

> "porque sí".

Una recomendación debe tener razón.

Ejemplo:

> "Ya trabajaste Knapsack con Greedy. Probá Dynamic Programming para observar qué cambia cuando la estrategia local deja de ser suficiente."

Eso enseña.

---

# 64. PISTAS

Mantener la idea de:

máximo 3 pistas por ejercicio.

NO implementar un chatbot.

NO implementar IA.

Las pistas deben:

* ayudar
* no regalar
* ser progresivas
* no contener directamente la solución

Y no deberían aparecer siempre en el mismo orden si la aleatorización realmente mejora la experiencia.

---

# 65. LAS PISTAS NO DEBEN ROMPER LA PROGRESIÓN

Una pista puede decir:

> "Observá qué ocurre cuando..."

No:

> "Implementá `dp[i] = ...`."

---

# 66. SOLVE: EL EDITOR TIENE QUE SENTIRSE REAL

Revisar:

* Tab
* Shift+Tab
* Enter
* indentación
* selección
* cursor
* navegación
* scroll
* persistencia
* reset
* errores
* ejecución

El usuario ya detectó que la edición no se siente suficientemente natural.

Eso es importante.

---

# 67. TESTS

Los tests deben decir:

* qué falló
* en qué caso
* qué propiedad se esperaba

pero NO revelar automáticamente:

* algoritmo
* solución
* recurrencia
* implementación canónica

---

# 68. DIFERENCIAR ERROR DEL ALUMNO DE ERROR DEL SISTEMA

Estados claros:

### Código incorrecto

El programa del estudiante produjo un resultado incorrecto.

### Test falló

La solución no cumple una propiedad.

### Error de ejecución

El código lanzó una excepción.

### Pyodide no inicializó

Problema del runtime.

### Timeout

La ejecución excedió el límite.

### Error interno

Problema de Visual TDA.

Nunca mezclar estos estados.

---

# 69. ENTENDER

Understand tiene que enseñar.

No es un repositorio de soluciones.

Debe responder:

> ¿Por qué funciona?

> ¿Qué mantiene como invariante?

> ¿Qué complejidad tiene?

> ¿De dónde sale?

> ¿Qué supuestos necesita?

> ¿Cuándo falla la idea?

> ¿Qué alternativas existen?

---

# 70. SOLUCIÓN PYTHON

Mantener:

* algoritmo puro
* sin main innecesario
* sin demo
* sin prints innecesarios
* sin infraestructura

Pero presentar el código de forma agradable.

---

# 71. PSEUDOCÓDIGO

No mostrarlo como una pared.

Permitir:

* expandir
* contraer
* comparar
* cambiar entre pseudocódigo y Python

---

# 72. COMPLEJIDAD

No escribir solamente:

> O(n log n)

Explicar:

> de dónde viene.

Ejemplo:

```text
T(n) = 2T(n/2) + O(n)
```

y explicar:

* dos subproblemas
* merge lineal
* altura logarítmica
* trabajo por nivel

cuando corresponda.

---

# 73. FORMULAS

No mostrar LaTeX crudo.

Nunca:

```text
\text{Total Inversiones}
```

como texto.

Las fórmulas tienen que renderizarse correctamente.

---

# 74. CALIDAD MATEMÁTICA

Revisá:

* notación
* índices
* desigualdades
* complejidades
* recurrencias
* definiciones
* invariantes
* demostraciones

Una página visualmente hermosa pero matemáticamente incorrecta es un fracaso.

---

# 75. EJERCICIOS DE BACKTRACKING

Explicar claramente:

```text
Brute Force
↓
espacio de búsqueda
↓
Backtracking
↓
construcción parcial
↓
restricción
↓
poda
```

Y aclarar:

> peor caso puede seguir siendo exponencial.

No decir:

> "Backtracking es rápido."

---

# 76. BRANCH & BOUND

Mostrar explícitamente:

* solución parcial
* bound
* incumbent
* comparación
* poda
* ramas descartadas

El estudiante debe poder ver por qué una rama desaparece.

---

# 77. DP

Mostrar:

* subproblemas
* dependencias
* tabla
* orden
* transición
* reconstrucción

No solamente el resultado.

---

# 78. GREEDY

Mostrar:

* decisión local
* estado actual
* criterio
* consecuencia
* garantía cuando exista
* contraejemplo cuando no exista

---

# 79. DIVIDE & CONQUER

Mostrar:

```text
divide
↓
subproblemas
↓
solve
↓
combine
```

Y la relación entre el árbol de recursión y la complejidad.

---

# 80. GRAPHS

Para grafos:

* nodos
* aristas
* pesos
* dirección
* estado
* selección
* relajación
* componente

deben distinguirse claramente.

---

# 81. MAX FLOW

La visualización debe hacer visible:

```text
capacity
flow
residual capacity
augmenting path
bottleneck
updated flow
min cut
```

No solamente animar flechas.

---

# 82. LP

La representación debe ayudar a entender:

* restricciones
* región factible
* función objetivo
* dirección
* vértices
* solución

No un gráfico decorativo.

---

# 83. REDUCCIONES

Mostrar:

```text
Problema A
   ↓ transformación
Problema B
```

y hacer evidente:

* transformación
* correspondencia
* solución
* equivalencia

---

# 84. APPROXIMATION

Mostrar:

* solución producida
* optimum si pedagógicamente corresponde
* ratio
* garantía

sin convertirlo en un juego de "ganarle al algoritmo".

---

# 85. RANDOMIZED

Mostrar claramente:

* aleatoriedad
* semilla si corresponde
* múltiples ejecuciones
* distribución o variación
* diferencia entre una ejecución y comportamiento esperado

---

# 86. 37 EJERCICIOS: NO DEBEN SER 37 COPIAS

Auditar cada uno individualmente.

Crear:

`docs/exercise-quality-matrix.md`

Pero ahora agregar:

* calidad visual
* calidad de ejemplo
* calidad de interacción
* calidad de explicación
* personalización
* métricas
* relación problema/técnica
* calidad del flujo
* calidad light
* calidad dark
* calidad ES
* calidad EN
* legibilidad
* densidad
* feedback
* errores
* accesibilidad
* browser QA
* human QA

---

# 87. CADA EJERCICIO DEBE TENER UNA "IDEA VISUAL CENTRAL"

Crear una columna:

> Visual metaphor / mental model

Ejemplos:

Knapsack:

> mochila + objetos + capacidad.

Huffman:

> bosque que se transforma en árbol.

Dijkstra:

> frontera de distancias.

Backtracking:

> árbol de decisiones.

DP:

> mapa de subproblemas.

Esto obliga a diseñar en torno al concepto.

---

# 88. NO FORZAR VISUALIZACIONES CUANDO NO APORTAN

Si después de analizar un ejercicio determinás que cierta visualización concreta no aporta:

documentalo.

Pero no uses esto como excusa para no hacer trabajo.

---

# 89. IMÁGENES 2D ILUSTRATIVAS

Para algunos ejercicios puede ser mejor una ilustración 2D inicial que un gráfico algorítmico.

Por ejemplo:

* mochila
* scheduling
* Huffman
* flujo
* reducción

Evaluá cada caso.

Podés crear ilustraciones SVG propias.

No dependas de imágenes externas innecesarias.

---

# 90. NO USAR IMÁGENES COMO RELLENO

Toda imagen debe responder:

> "¿Qué aprende el estudiante mirando esto?"

Si no hay respuesta:

eliminarla.

---

# 91. DISEÑO GRÁFICO

Investigá y aplicá principios reales de:

* information architecture
* visual hierarchy
* typography
* spacing
* contrast
* Gestalt
* cognitive load
* progressive disclosure
* interaction design
* data visualization
* educational visualization

No hace falta llenar el repositorio de papers.

Pero sí aplicar principios concretos.

Si necesitás investigar externamente, hacelo.

---

# 92. DATA VISUALIZATION

No diseñes gráficos como ilustraciones de marketing.

Aplicá:

* escala adecuada
* ejes cuando correspondan
* leyendas
* unidades
* labels
* consistencia
* reducción de ruido
* jerarquía

---

# 93. NO TODOS LOS GRÁFICOS NECESITAN EJES

Por ejemplo:

un árbol de Backtracking no necesita eje X/Y.

Pero un gráfico de:

> tiempo vs tamaño de entrada

sí.

Pensá antes de dibujar.

---

# 94. TIPOGRAFÍA

Revisar:

* tamaño
* line-height
* longitud de línea
* títulos
* subtítulos
* captions
* código
* fórmulas

Evitar:

* texto microscópico
* párrafos gigantes
* headings enormes sin propósito

---

# 95. ICONOGRAFÍA

Usar iconos de forma consistente.

No reemplazar texto importante con iconos ambiguos.

---

# 96. ESTADOS DE INTERFAZ

Cada componente importante debe contemplar:

* loading
* vacío
* activo
* hover
* focus
* disabled
* error
* success
* ejecución
* timeout

---

# 97. ACCESIBILIDAD

Revisar:

* keyboard
* focus
* labels
* aria
* contraste
* reduced motion
* no depender solamente de color

Especialmente visualizadores.

---

# 98. ANIMACIONES

Las animaciones deben:

* tener propósito
* ser controlables
* respetar reduced motion
* no impedir interacción
* no hacer esperar innecesariamente

---

# 99. PERFORMANCE

No sacrificar performance por gráficos.

Pero tampoco sacrificar calidad visual solamente para ahorrar unos KB si no es necesario.

Usar:

* lazy loading
* code splitting
* memoización donde tenga sentido
* virtualización cuando corresponda
* trazas limitadas
* inputs seguros

---

# 100. SEGURIDAD

Mantener:

* Pyodide aislado
* watchdog
* límites
* sanitización
* CSP
* sin backend innecesario
* sin guardar información sensible

Y documentar honestamente:

> client-side no significa secreto.

---

# 101. PRIVACIDAD

No crear tracking invasivo.

Si se agregan métricas:

deben ser:

* anónimas
* mínimas
* justificadas
* opcionales cuando corresponda

No recolectar datos personales sin necesidad.

---

# 102. "NO HAY BUGS" NO SE DEMUESTRA CON UN COMANDO

La meta:

> "que no haya bugs"

debe traducirse a:

* más cobertura
* tests
* property tests
* browser tests
* visual QA
* edge cases
* manual QA
* independent oracles
* cross-browser razonable

No prometas perfección.

Construí evidencia.

---

# 103. TESTING DE VISUALIZADORES

Para cada visualizador probar:

* input mínimo
* input típico
* input grande seguro
* input inválido
* estado vacío
* múltiples pasos
* reset
* replay
* custom input
* theme light
* theme dark
* idioma ES
* idioma EN

---

# 104. TESTING VISUAL

Si tenés browser automation:

usala para screenshots.

Pero además:

mirá las screenshots.

No declares:

> "visual QA PASS"

si nadie observó visualmente el resultado.

---

# 105. IMPORTANTE: NO MIENTAS SOBRE VISUAL QA

Nunca escribir:

> VERIFIED VISUAL

si solamente hiciste:

```text
npm test
```

Nunca.

---

# 106. TESTEAR LA EXPERIENCIA, NO SOLAMENTE COMPONENTES

Un flujo real:

```text
Home
↓
Categoría
↓
Ejercicio
↓
Discover
↓
Caso propio
↓
Visualización
↓
Solve
↓
Código
↓
Test
↓
Understand
↓
Solución
```

debe funcionar.

---

# 107. TESTEAR FLUJOS DE ERROR

Ejemplos:

```text
Pyodide falla
↓
mensaje correcto
↓
retry
```

```text
código infinito
↓
timeout
↓
usuario puede continuar
```

```text
input inválido
↓
feedback
↓
corregir
```

```text
visualizador sin datos
↓
estado vacío razonable
```

---

# 108. LIGHT MODE Y DARK MODE EN TODA LA APP

No solamente Home.

Probar cada ejercicio.

Especialmente:

* SVG
* matrices
* grafos
* timelines
* código
* fórmulas
* badges
* sliders

---

# 109. ES/EN EN TODA LA APP

Hacer una auditoría automática buscando:

* strings hardcodeados
* español dentro de EN
* inglés dentro de ES
* mensajes dinámicos
* labels
* aria-labels
* tooltips

Pero después hacer revisión visual real.

---

# 110. TERMINOLOGÍA CONSISTENTE

No mezclar:

* Greedy
* Voraz
* Heurística
* Estrategia codiciosa

sin una razón documentada.

La terminología debe ser deliberada.

Respetar la decisión actual del proyecto de usar:

> Greedy

y no introducir "voraz" como traducción de interfaz.

---

# 111. NO INFANTILIZAR

Los estudiantes son universitarios.

Usar:

* precisión
* claridad
* humor ocasional si aporta
* diseño atractivo

No:

* emojis gigantes
* "¡Excelente!"
* "¡Sos un crack!"
* badges infantiles
* gamificación vacía

---

# 112. PERO HACER QUE SEA ENGANCHANTE

"Enganchante" no significa infantil.

Debe enganchar mediante:

* curiosidad
* experimentación
* descubrimiento
* comparación
* feedback
* progreso
* problemas interesantes

La experiencia ideal:

> "Quiero probar qué pasa si cambio esto."

---

# 113. GAMIFICACIÓN CON CUIDADO

Podés usar:

* progreso
* desafíos
* experimentos
* casos borde
* comparación

No necesitamos:

* leaderboard
* puntos absurdos
* monedas
* XP
* recompensas infantiles

---

# 114. EL PRODUCTO DEBE ENSEÑAR SIN SENTIRSE COMO UN LIBRO

No convertir la página en:

> PDF interactivo.

El estudiante debe interactuar.

---

# 115. EL PRODUCTO TAMPOCO DEBE SER UN JUEGO

Debe existir una tensión sana:

```text
jugar con el problema
        ↓
entender el problema
        ↓
razonar
        ↓
programar
        ↓
formalizar
```

---

# 116. APRENDIZAJE ACTIVO

Cada ejercicio debería contener al menos una oportunidad de:

* predecir
* modificar
* comparar
* equivocarse
* observar
* justificar

cuando sea apropiado.

---

# 117. PREGUNTAS INTERACTIVAS

Podés incorporar preguntas pequeñas.

Ejemplo:

> "¿Cuál de estas decisiones debería hacerse primero?"

El estudiante responde.

Luego:

> explicación.

No hagas cuestionarios eternos.

---

# 118. PREDICCIÓN ANTES DE EJECUCIÓN

Una herramienta poderosa.

Ejemplo:

> "¿Qué arista creés que se seleccionará?"

El estudiante responde.

Después:

> ejecutar.

Esto convierte la animación en aprendizaje.

---

# 119. NO REVELAR LA RESPUESTA ANTES DE TIEMPO

Mantener las reglas pedagógicas anteriores.

---

# 120. COMPARACIÓN ANTES/DESPUÉS

Siempre que ayude:

mostrar:

```text
antes
↓
acción
↓
después
```

Esto es especialmente útil para:

* DP
* Greedy
* Backtracking
* Graphs
* Sorting
* Flow

---

# 121. MÉTRICAS REALES

Cuando sea posible:

mostrar:

* pasos
* estados
* comparaciones
* ramas
* podas
* relajaciones
* memoria
* tiempo

Pero solo si realmente se pueden medir correctamente.

---

# 122. NO FALSEAR MÉTRICAS

Nunca mostrar:

> "0.003 ms"

como si fuera una medición científicamente significativa si la medición no lo permite.

---

# 123. EJERCICIOS CON DATOS RANDOM

Random puede ser útil.

Pero:

* permitir reproducibilidad
* guardar semilla cuando corresponda
* permitir regenerar
* no generar casos incomprensibles

---

# 124. EJEMPLOS CURADOS + RANDOM

Ideal:

```text
Ejemplo guiado
Caso propio
Caso aleatorio
```

cuando tenga sentido.

---

# 125. CURRICULUM

No aumentar el número de ejercicios automáticamente.

Preguntar:

> ¿Qué hueco conceptual cubre este ejercicio?

Si no cubre ninguno:

no agregar.

---

# 126. NO TODOS LOS EJERCICIOS NECESITAN SER IGUAL DE PROFUNDOS

Pero cada ejercicio debe ser suficientemente bueno para su objetivo.

Algunos pueden ser:

* introductorios
* centrales
* desafiantes
* integradores

Documentar la función curricular.

---

# 127. DIFICULTAD

No usar solamente:

```text
1 2 3 4
```

sin explicación.

La dificultad debería considerar:

* carga conceptual
* implementación
* complejidad matemática
* tamaño del espacio de búsqueda
* abstracción

---

# 128. PROGRESIÓN

El catálogo debería sugerir una ruta.

Pero no obligarla.

Un estudiante avanzado puede saltar.

---

# 129. "CONTINUAR APRENDIENDO"

Debe llevar a una acción real.

No un botón decorativo.

---

# 130. "RECOMENDADO"

Debe ser accionable.

---

# 131. "COMPLETADO"

Debe significar algo.

No permitir que explorar un playground marque:

> completed.

---

# 132. PROGRESO

Debe distinguir:

* visto
* explorado
* intentado
* probado
* resuelto
* comprendido

si la arquitectura actual puede soportarlo sin sobreingeniería.

---

# 133. ESTUDIANTE NO DEBE PERDERSE

En todo momento debe ser obvio:

> dónde estoy.

Y:

> qué puedo hacer ahora.

---

# 134. EMPTY STATES

Diseñar correctamente:

* sin input
* sin ejecución
* sin resultados
* sin datos
* sin ejercicios completados

---

# 135. MENSAJES DE ERROR

No usar mensajes técnicos incomprensibles.

Ejemplo malo:

> `Cannot read properties of undefined`

si puede evitarse.

Mostrar:

> "No hay datos suficientes para ejecutar esta visualización."

y registrar el detalle técnico donde corresponda.

---

# 136. DEBUGGING

Los errores técnicos siguen disponibles para desarrollo.

No exponerlos innecesariamente al estudiante.

---

# 137. RESPONSIVE

Prioridad:

1. desktop
2. notebook
3. tablet
4. mobile

pero sin romper las últimas dos.

---

# 138. 1920×1080

Aprovechar el espacio.

No:

```text
contenido de 700px
████████████████████
████████████████████
```

cuando podría existir:

```text
visualización | explicación
visualización | controles
```

---

# 139. 1366×768

Debe seguir siendo usable.

---

# 140. DENSIDAD

La página no debe ser:

* demasiado vacía
* demasiado cargada

Encontrá un equilibrio.

---

# 141. DISEÑO DE CADA EJERCICIO

Antes de tocar código de un visualizador:

crear mentalmente:

```text
problema
↓
modelo mental
↓
estado
↓
interacción
↓
visual
↓
feedback
↓
aprendizaje
```

No:

```text
componente React
↓
div
↓
SVG
```

---

# 142. NO COPIAR EL MISMO LAYOUT 37 VECES

Debe existir un sistema común.

Pero cada ejercicio puede tener composición específica.

---

# 143. COMPONENTES REUTILIZABLES

Reutilizar:

* timeline
* controles
* paneles
* inputs
* métricas
* leyendas
* estados
* tooltips
* tabs

pero NO forzar que todos los visualizadores tengan la misma forma.

---

# 144. ABSTRACCIONES

KISS.

DRY cuando exista repetición real.

YAGNI.

No construir un "UniversalAlgorithmVisualizerFramework™".

---

# 145. ARCHITECTURE

Mantener:

```text
algorithm
↓
trace
↓
visualizer
↓
interaction
↓
UI
```

No mezclar lógica algorítmica con presentación innecesariamente.

---

# 146. NO ROMPER LO BUENO

Antes de refactorizar:

* identificar dependencias
* agregar tests
* cambiar
* verificar

---

# 147. GIT

No:

* reset destructivo
* force push
* borrar trabajo del usuario
* mergear main sin autorización

Sí:

* commits pequeños
* commits descriptivos
* branch actual
* working tree limpio cuando corresponda

---

# 148. DOCUMENTACIÓN

Actualizar:

* state.md
* next.md
* sessions
* quality matrix
* known issues
* design audit

No declarar COMPLETE si quedan P1/P2 abiertos.

---

# 149. DOCUMENTACIÓN ≠ VERIFICACIÓN

Si:

`state.md`

dice:

> VERIFIED

pero no existe evidencia:

no está VERIFIED.

Corregí el documento.

---

# 150. EL ERROR DE LOS REPORTES ANTERIORES

Reportes anteriores afirmaron cosas como:

> 100% visualizadores

> VERIFIED

> 37/37

> 256/256

Esto puede ser técnicamente correcto respecto de implementación.

Pero NO es suficiente para declarar el producto terminado.

Desde ahora:

# "IMPLEMENTED" ≠ "GOOD"

# "TESTED" ≠ "PEDAGOGICALLY VALID"

# "RENDERED" ≠ "WELL DESIGNED"

# "VERIFIED" ≠ "VISUALLY VERIFIED"

---

# 151. NUEVO SISTEMA DE ESTADOS

Para funcionalidades visuales usar:

### IMPLEMENTED

Existe.

### FUNCTIONALLY VERIFIED

Funciona según tests.

### VISUALLY REVIEWED

Fue observado en navegador.

### PEDAGOGICALLY REVIEWED

Se verificó que ayuda al aprendizaje.

### PRESENTATION READY

Cumple el estándar final.

No saltar directamente de:

> IMPLEMENTED

a:

> PRESENTATION READY.

---

# 152. AUDITORÍA INDEPENDIENTE

Antes de seguir agregando features:

hacer una auditoría completa.

No uses tus propios supuestos como única evidencia.

Podés utilizar agentes especializados si están disponibles:

### Agent 1

UX / IA

### Agent 2

visual design

### Agent 3

pedagogy

### Agent 4

accessibility

### Agent 5

QA

### Agent 6

algorithm correctness

### Agent 7

performance

Luego integrar resultados.

---

# 153. AGENTES NO DEBEN DUPLICAR TRABAJO

Cada agente debe tener un scope claro.

---

# 154. AUDITOR VISUAL

Debe abrir la web.

Debe mirar screenshots.

Debe identificar:

* espacios
* colores
* tamaños
* alineación
* gráficos
* jerarquía
* inconsistencias

No leer solamente CSS.

---

# 155. AUDITOR PEDAGÓGICO

Debe preguntarse:

> "¿Después de usar este ejercicio entiendo más que antes?"

Si no:

fallo.

---

# 156. AUDITOR DE ESTUDIANTE

Debe simular:

> estudiante que nunca vio este ejercicio.

No asumir conocimiento del código interno.

---

# 157. AUDITOR DE PROFESOR

Debe preguntarse:

> "¿Podría mostrar esto en una clase universitaria sin sentir que es un prototipo?"

---

# 158. AUDITOR DE DISEÑO

Investigar principios reales de:

* UX
* information architecture
* educational technology
* data visualization
* visual hierarchy

No copiar diseños.

Extraer principios.

---

# 159. INVESTIGACIÓN EXTERNA

Si necesitás estudiar:

* buenas prácticas de visualización de algoritmos
* educational visualization
* UX de IDEs
* data visualization
* accesibilidad
* interacción con grafos
* diseño de interfaces educativas

investigá.

Pero convertí esa investigación en decisiones concretas.

---

# 160. NO HAGAS UN ENSAYO ACADÉMICO

La investigación debe terminar en:

> "Por esto cambiamos X."

---

# 161. DISEÑO COMO HIPÓTESIS

Para cada cambio importante:

```text
Problema
↓
Hipótesis
↓
Cambio
↓
Prueba
↓
Resultado
```

Ejemplo:

> Problema: estudiantes no entienden el estado actual.

> Hipótesis: falta jerarquía visual.

> Cambio: aumentar visualización + estado actual + explicación.

> Prueba: flujo manual.

---

# 162. USABILIDAD

Cuando sea posible, hacer pequeños experimentos.

Ejemplo:

> "¿Podría alguien encontrar cómo cambiar el input sin instrucciones?"

Si no:

el diseño necesita mejora.

---

# 163. NO ES NECESARIO USAR USUARIOS REALES TODAVÍA

Pero diseñá pensando en ellos.

---

# 164. PRUEBAS CON "FIRST CONTACT"

Abrí una sesión limpia.

No uses tu memoria del producto.

Intentá descubrir:

* qué hacer
* dónde hacer clic
* qué significa cada fase
* cómo volver
* cómo practicar

---

# 165. EVITAR CONOCIMIENTO DEL DESARROLLADOR

Este es uno de los mayores riesgos actuales.

Vos sabés:

> dónde está todo.

El estudiante no.

---

# 166. "OBVIOUSNESS TEST"

Para cada interacción importante:

> ¿Es obvio sin documentación?

Si no:

mejorar UI.

---

# 167. MICROCOPY

Revisar:

* botones
* labels
* placeholders
* mensajes
* headings
* tooltips

Una palabra incorrecta puede romper una interacción.

---

# 168. NO SOBRECARGAR CON TEXTO

Cuando una idea puede mostrarse:

mostrala.

Cuando necesita explicación:

escribila.

---

# 169. NO SOBRECARGAR CON GRÁFICOS

Cuando un gráfico complica más de lo que explica:

simplificar.

---

# 170. VISUALIZACIÓN = COMPRESIÓN COGNITIVA

Un buen gráfico debe permitir entender algo más rápido que leyendo un párrafo.

Si no:

revisarlo.

---

# 171. TODO VISUALIZADOR DEBE TENER UNA PREGUNTA PEDAGÓGICA

Ejemplos:

### Knapsack

"¿Qué objetos conviene incluir bajo esta capacidad?"

### Dijkstra

"¿Por qué esta distancia deja de cambiar?"

### Huffman

"¿Por qué combinar los dos mínimos?"

### N-Queens

"¿Qué hace que una colocación sea imposible?"

### DP

"¿Qué subproblemas necesito conocer para resolver este?"

---

# 172. EL GRÁFICO DEBE RESPONDER ESA PREGUNTA

Si no:

mal diseño.

---

# 173. CASO ESPECIAL: GRÁFICOS DE TIEMPO

Si mostramos runtime:

No hacer que la comparación dependa de una sola ejecución.

Preferir:

* múltiples ejecuciones
* mediana
* promedio cuando corresponda
* rango
* advertencia de variabilidad

si el benchmark pretende enseñar algo.

---

# 174. CASO ESPECIAL: PYODIDE

Distinguir:

```text
carga de runtime
```

de:

```text
tiempo del algoritmo
```

cuando se mida.

No mezclar.

---

# 175. NO CREAR FALSAS CONCLUSIONES

Nunca decir:

> "Este algoritmo es 10x más rápido."

si el experimento no permite sostenerlo.

Decir:

> "En esta ejecución..."

---

# 176. EDUCACIÓN SOBRE COMPLEJIDAD

No reemplazar la teoría con benchmark.

El benchmark ilustra.

La complejidad explica crecimiento asintótico.

---

# 177. PROBLEMAS DE LAYOUT

Buscar específicamente:

* columnas demasiado estrechas
* cards demasiado altas
* contenido demasiado abajo
* controles separados del gráfico
* títulos repetidos
* espacios vacíos
* scroll innecesario
* información importante fuera de viewport

---

# 178. ABOVE THE FOLD

Para cada pantalla:

preguntá:

> ¿Qué debería entender el estudiante durante los primeros segundos?

Diseñá para eso.

---

# 179. HOME

La Home debe responder:

1. qué es Visual TDA
2. qué puedo aprender
3. cómo empezar
4. dónde continuar

No 15 segundos de lectura.

---

# 180. CATÁLOGO

Debe responder:

> "¿Qué quiero practicar ahora?"

---

# 181. EJERCICIO

Debe responder:

> "¿Qué estoy tratando de entender?"

---

# 182. DISCOVER

Debe responder:

> "¿Qué pasa si lo pruebo?"

---

# 183. SOLVE

Debe responder:

> "¿Puedo implementarlo?"

---

# 184. UNDERSTAND

Debe responder:

> "¿Por qué funciona?"

---

# 185. CIERRE DE CICLO

Ideal:

```text
descubro
↓
predigo
↓
experimento
↓
implemento
↓
falla
↓
corrijo
↓
comprendo
↓
comparo
↓
generalizo
```

Ese es el producto.

---

# 186. NO PERMITIR QUE LA PLATAFORMA SE CONVIERTA EN "ANIMATION GALLERY"

Este riesgo es alto.

La aplicación no debe ser:

> "Mirá qué lindo cómo se mueve Dijkstra."

Debe ser:

> "Mirá qué ocurre cuando relajamos esta arista y por qué."

---

# 187. CADA ANIMACIÓN NECESITA CONTEXTO

No:

> play

Sí:

> "Se selecciona el vértice con menor distancia tentativa."

---

# 188. INTERACCIÓN Y EXPLICACIÓN DEBEN ESTAR CONECTADAS

Si el usuario hace clic:

la explicación debe reaccionar.

---

# 189. PERSONALIZACIÓN Y EXPLICACIÓN

Si cambio el ejemplo:

la explicación debe seguir siendo correcta.

No usar texto hardcodeado que deja de coincidir con el gráfico.

---

# 190. GENERACIÓN DE CONTENIDO

Evitar strings específicas del ejemplo dentro de componentes globales.

---

# 191. DATA-DRIVEN

Siempre que sea posible:

```text
exercise definition
↓
content
↓
trace
↓
visualization
```

---

# 192. PERO NO SOBRABSTRAER

No construir sistemas gigantes para 2 líneas repetidas.

---

# 193. DOCUMENTAR DECISIONES VISUALES

Cuando una visualización tenga una arquitectura particular:

documentar por qué.

Especialmente:

* Knapsack
* Huffman
* N-Queens
* DP
* graphs
* LP

---

# 194. QUALITY GATE NUEVO

No declarar un ejercicio PRESENTATION READY si falla cualquiera de:

### Correctness

PASS

### Functional UX

PASS

### Visual

PASS

### Pedagogical

PASS

### Accessibility

PASS

### ES/EN

PASS

### Light/Dark

PASS

### Custom input

PASS cuando corresponda

### Error handling

PASS

---

# 195. QUALITY GATE DE LA PÁGINA ENTERA

Antes de considerar la app excelente:

* Home
* Catalog
* Exercise
* Discover
* Solve
* Understand
* Recommendations
* Progress
* Settings
* Light
* Dark
* ES
* EN

deben haber sido revisados.

---

# 196. NO DECLARAR "100%" POR CONTAR FEATURES

El porcentaje no es:

```text
features implemented / features requested
```

La calidad es multidimensional.

---

# 197. MATRIZ DE CALIDAD

Actualizar:

`docs/exercise-quality-matrix.md`

con estados independientes.

Ejemplo:

| Área           | Estado             |
| -------------- | ------------------ |
| Implementación | VERIFIED           |
| Funcionalidad  | VERIFIED           |
| Visual         | PARTIALLY VERIFIED |
| Pedagogía      | UNVERIFIED         |
| Light          | FAILED             |
| EN             | PARTIALLY VERIFIED |

Eso es mucho más útil que:

> COMPLETE.

---

# 198. KNOWN ISSUES

Actualizar:

`docs/known-issues.md`

No esconder problemas.

---

# 199. ROADMAP

`next.md` debe contener trabajo REAL pendiente.

No:

> "No hay tareas."

si todavía existen problemas de UX.

---

# 200. STATE

`state.md` debe representar la realidad.

Si hay P1/P2:

NO:

> COMPLETE.

---

# 201. SESSION LOG

Registrar:

* qué auditaste
* qué encontraste
* qué corregiste
* qué sigue
* qué quedó pendiente

---

# 202. PRIMERA FASE DE ESTA MISIÓN

NO IMPLEMENTES INMEDIATAMENTE.

Primero:

## AUDIT.

Hacé:

1. browser exploration
2. screenshots
3. navegación completa
4. 5-10 ejercicios representativos
5. light
6. dark
7. ES
8. EN
9. custom inputs
10. recommendations
11. progress
12. exercise transitions

---

# 203. EJERCICIOS REPRESENTATIVOS MÍNIMOS

Elegí al menos:

* N-Queens
* Knapsack Greedy
* Knapsack DP
* Huffman
* Dijkstra
* Merge Sort
* Inversion Counting
* TSP Branch & Bound
* Max Flow
* Linear Programming

Porque cubren diferentes tipos de visualización.

---

# 204. DESPUÉS AMPLIAR A LOS 37

No arreglar solamente los ejemplos anteriores.

Usarlos como muestra para detectar problemas sistémicos.

Después aplicar el aprendizaje al resto.

---

# 205. PRIORIZACIÓN

Prioridad:

## P0

Broken.

## P1

Learning-breaking.

## P2

Major UX/design.

## P3

Polish.

## P4

Nice-to-have.

No gastes una semana en P4 mientras existe P1.

---

# 206. ORDEN DE TRABAJO

Preferencia:

```text
auditoría
↓
arquitectura de diseño
↓
design system
↓
layout
↓
visualizers
↓
interactions
↓
content
↓
microcopy
↓
polish
↓
testing
```

No necesariamente estrictamente lineal.

---

# 207. NO REHACER TODO POR CAPRICHO

Si algo funciona bien:

conservar.

Mejorar solamente cuando exista evidencia.

---

# 208. NO HACER "REDESIGN" SIN MOTIVO

Cada gran cambio debe resolver un problema.

---

# 209. DESIGN SYSTEM

Si actualmente hay inconsistencias:

crear/reforzar:

* spacing
* typography
* radii
* shadows
* colors
* panel types
* buttons
* controls
* cards
* badges
* tabs

---

# 210. NO EXAGERAR SHADOWS

Queremos ingeniería, no casino.

---

# 211. NO EXAGERAR GRADIENTES

Usarlos solamente cuando aporten.

---

# 212. NO EXAGERAR ROUNDED CARDS

No todo necesita parecer un botón flotante.

---

# 213. INTERFAZ UNIVERSITARIA

Debe sentirse:

* precisa
* limpia
* técnica
* moderna
* calmada
* enfocada

---

# 214. NO SACRIFICAR INFORMACIÓN POR "MINIMALISMO"

Minimalismo no significa ocultar todo.

---

# 215. PROGRESSIVE DISCLOSURE

Mostrar primero:

lo necesario.

Permitir expandir:

lo profundo.

---

# 216. ESTUDIANTE AVANZADO

Debe poder profundizar.

No simplificar tanto que parezca una app infantil.

---

# 217. ESTUDIANTE PRINCIPIANTE EN EL TEMA

Debe poder seguir la experiencia.

No asumir términos que todavía no fueron introducidos.

---

# 218. EXPLICACIONES CONTEXTUALES

Cuando aparezca un concepto nuevo:

permitir:

* tooltip
* definición
* enlace interno
* panel contextual

según la importancia.

---

# 219. NO LLENAR TODO DE TOOLTIPS

Si todo tiene tooltip:

nada tiene jerarquía.

---

# 220. EJEMPLO: HEURÍSTICA

Primera aparición:

> Heurística

y una pequeña explicación accesible.

Luego:

podés usar el término sin repetir la definición.

---

# 221. EJEMPLO: INVARIANTE

Primera aparición:

> Invariante: propiedad que permanece verdadera durante la ejecución del algoritmo.

Luego usar:

> invariante.

---

# 222. EJEMPLO: RELAJACIÓN

Para Dijkstra/Bellman-Ford:

explicar claramente qué significa.

---

# 223. NO SUPONER TERMINOLOGÍA SIN CONTEXTO

Pero tampoco traducir cada término técnico a lenguaje coloquial.

---

# 224. DOCUMENTAR GLOSARIO

Crear si realmente aporta:

`docs/glossary.md`

Pero el estudiante debe recibir el concepto en contexto, no ser enviado a leer un diccionario.

---

# 225. USAR LOS ERRORES COMO MATERIAL PEDAGÓGICO

Un error bien explicado puede enseñar más que un éxito.

---

# 226. INVALID STATES

Cuando un estado inválido sea educativamente útil:

permitirlo.

Ejemplos:

* N-Queens
* graph coloring
* scheduling
* knapsack
* flow

---

# 227. NO BLOQUEAR AL ESTUDIANTE POR DISEÑO

Si el error es seguro y educativo:

permitirlo.

---

# 228. PERO VALIDAR

Mostrar:

* qué está mal
* por qué
* qué restricción se viola

---

# 229. CASOS PROPIOS

El estudiante debería sentir:

> "Esto es MI experimento."

No:

> "Estoy viendo una demo fija."

---

# 230. LA WEB DEBE SER UN LABORATORIO

La metáfora del producto es:

# algoritmo laboratory

No:

# algorithm museum.

---

# 231. LABORATORIO SIGNIFICA

* experimentar
* cambiar
* romper
* comparar
* observar
* medir
* explicar

---

# 232. MEDICIÓN

Cuando corresponda:

permitir medir.

Pero con contexto.

---

# 233. NO HACER BENCHMARKING CIENTÍFICO FALSO

El objetivo es educativo.

---

# 234. COMPARAR ESCALABILIDAD

Cuando tenga sentido:

```text
n
states
time
```

y mostrar tendencia.

---

# 235. VISUALIZACIÓN DE CRECIMIENTO

Puede ser:

* tabla
* gráfico
* barras
* línea

según el problema.

---

# 236. NO USAR GRÁFICOS ESTADÍSTICOS SIN DATOS SUFICIENTES

No dibujar curvas ficticias.

---

# 237. RANDOMIZACIÓN CONTROLADA

Cuando un ejercicio use random:

permitir reproducir casos.

---

# 238. EXPERIENCIA DE REINICIO

Reset debe ser:

* claro
* seguro
* rápido

---

# 239. NO PERDER TRABAJO DEL ESTUDIANTE

Advertir si reseteará código/input.

---

# 240. PERSISTENCIA

Mantener:

* código
* progreso
* preferencias

según la arquitectura actual.

---

# 241. NO GUARDAR DATOS INNECESARIOS

Mantener privacidad.

---

# 242. NO BACKEND POR AHORA

No introducir backend solamente para resolver UX.

---

# 243. NO AUTH

No introducir login salvo necesidad futura real.

---

# 244. NO IA

No implementar chatbot/tutor IA.

Las pistas son suficientes.

---

# 245. AGENTES

Podés utilizar agentes para:

* visual QA
* UX
* accessibility
* code review
* content audit

pero el resultado final debe integrarse coherentemente.

---

# 246. NO CONFIAR EN EL AGENTE QUE HIZO EL CAMBIO

El mismo agente no es suficiente como única validación.

---

# 247. SEGUNDA MIRADA

Cuando sea posible:

hacer una segunda revisión independiente.

---

# 248. TESTS DEL TESTING

Revisar también:

* validators
* oracles
* tests

Porque un test puede estar mal.

---

# 249. PROPERTY TESTING

Agregar cuando tenga sentido.

---

# 250. INDEPENDENT ORACLES

Mantener.

---

# 251. BROWSER TESTING

Mantener.

Pero complementar con inspección visual.

---

# 252. SCREENSHOTS

Generar capturas de:

* Home
* catálogo
* ejercicio
* Discover
* Solve
* Understand
* light
* dark
* ES
* EN
* visualizadores principales

Y revisarlas.

---

# 253. SCREENSHOT REVIEW

No basta con generar PNG.

Mirarlos.

---

# 254. DOCUMENTAR DEFECTOS VISUALES

Cada defecto encontrado debe tener:

* screenshot
* explicación
* prioridad

cuando sea útil.

---

# 255. NO OCULTAR DEFECTOS

Si una screenshot demuestra que algo está mal:

registrarlo.

---

# 256. CORREGIR SISTÉMICAMENTE

Si 15 visualizadores tienen:

> padding insuficiente

no arreglarlos uno por uno sin analizar el design system.

---

# 257. PERO NO SOBREGENERALIZAR

Si Knapsack necesita una composición diferente:

dejalo diferente.

---

# 258. EJERCICIO FLAGSHIP

Elegí 5 ejercicios para llevar a nivel excepcional:

* N-Queens
* Knapsack DP
* Huffman
* Dijkstra
* TSP Branch & Bound

Estos deben servir como referencia de calidad para los demás.

---

# 259. ESTÁNDAR FLAGSHIP

Cada uno debe tener:

* excelente gráfico
* custom input
* buena explicación
* trace
* interacción
* métricas
* errores
* light
* dark
* ES
* EN
* responsive
* accesibilidad

---

# 260. DESPUÉS PROPAGAR EL SISTEMA

Usar las lecciones de estos ejercicios para mejorar el resto.

---

# 261. NO HACER 37 VISUALIZADORES MEDIOCRES

Preferible:

37 correctos + algunos excelentes

que:

37 componentes técnicamente distintos pero mediocres.

Pero el objetivo final sigue siendo elevar todos.

---

# 262. CRITERIO DE CALIDAD

Preguntate:

> "Si un profesor de FIUBA abre esta página por primera vez, ¿parece una herramienta seria?"

Y:

> "Si un estudiante la usa durante 30 minutos, ¿aprendió algo?"

Ambas deben ser:

sí.

---

# 263. CRITERIO MÁS IMPORTANTE

Después de usar un ejercicio:

el estudiante debe poder explicar:

* qué problema resolvió
* qué idea utilizó
* por qué funciona
* qué complejidad tiene
* qué cambia si modifica el input

Si no puede:

la experiencia falló pedagógicamente.

---

# 264. NO ES NECESARIO QUE EL ESTUDIANTE LEA TODO

La comprensión puede emerger de:

* visualización
* interacción
* preguntas
* explicación
* código
* experimento

---

# 265. APRENDIZAJE ACTIVO > CONSUMO PASIVO

Siempre que sea razonable.

---

# 266. "¿QUÉ PASA SI...?"

Agregar preguntas de experimentación:

* ¿Qué pasa si N aumenta?
* ¿Qué pasa si cambio capacidad?
* ¿Qué pasa si agrego un peso?
* ¿Qué pasa si cambio una frecuencia?
* ¿Qué pasa si agrego una arista?
* ¿Qué pasa si elimino una restricción?

según ejercicio.

---

# 267. GENERALIZACIÓN

Al final:

> "¿Qué observaste?"

No necesariamente una respuesta automática.

---

# 268. EVITAR QUE LA PLATAFORMA RESPONDA TODO

Dejar espacio para pensar.

---

# 269. CONTRASTAR PREDICCIÓN Y RESULTADO

Excelente mecanismo:

```text
Tu predicción
↓
ejecución
↓
resultado
↓
explicación
```

---

# 270. NO CONVERTIR TODO EN QUIZ

Usar con moderación.

---

# 271. CONTENIDO ACADÉMICO

Debe ser consistente con:

* Kleinberg & Tardos
* material FIUBA
* fundamentos algorítmicos estándar

Cuando exista duda:

verificar.

---

# 272. REFERENCIAS

No inventar bibliografía.

---

# 273. MATEMÁTICA

No simplificar incorrectamente para "hacerlo fácil".

Explicar de forma accesible sin perder rigor.

---

# 274. ESPAÑOL ARGENTINO UNIVERSITARIO

Usar:

* "ejercicio"
* "prueba"
* "caso"
* "resolución"
* "complejidad"
* "arreglo" o "array" según contexto

pero mantener consistencia.

---

# 275. ENGLISH

Usar terminología académica estándar.

---

# 276. NO TRADUCIR AL INGLÉS LITERALMENTE

La versión EN debe sonar escrita en inglés técnico natural.

---

# 277. COPY AUDIT

Revisar todos los textos.

---

# 278. MICROCOPY AUDIT

Revisar cada botón.

---

# 279. ACCESSIBILITY COPY

Revisar:

* aria-labels
* descriptions
* announcements

también ES/EN.

---

# 280. VISUALIZER LABELS

No dejar:

> node1

si puede decir:

> Nodo actual

o equivalente.

---

# 281. NO USAR TEXTO TÉCNICO INTERNO EN UI

Nunca:

```text
stateType=RELAX_EDGE
```

para estudiantes.

---

# 282. INTERNAL VS EDUCATIONAL REPRESENTATION

Separar:

```text
TraceEvent interno
```

de:

```text
explicación humana
```

---

# 283. TRACE EVENTS

Deben contener suficiente información para construir visualizaciones ricas.

Pero no meter strings de UI dentro del algoritmo si se puede evitar.

---

# 284. INTERNATIONALIZATION

La traza debería ser estructural.

La traducción debe producirse en UI.

---

# 285. EVITAR HARDCODE

Especialmente:

* colores
* labels
* mensajes
* idioma

---

# 286. COMPONENTES

Mantener pequeños.

---

# 287. CSS

Evitar:

* números mágicos sin razón
* hacks
* overrides interminables
* estilos duplicados

---

# 288. DESIGN TOKENS

Usar variables.

---

# 289. NO INTRODUCIR UI LIBRARY SIN NECESIDAD

Mantener control.

---

# 290. DEPENDENCIAS

No agregar librerías solamente porque hacen un gráfico bonito.

Evaluar:

* tamaño
* mantenimiento
* accesibilidad
* compatibilidad
* necesidad real

---

# 291. THIRD PARTY

No depender de imágenes externas para elementos fundamentales.

---

# 292. OFFLINE / STATIC

Mantener la capacidad estática cuando sea posible.

---

# 293. DEPLOYMENT

Revisar que:

* rutas
* assets
* workers
* Pyodide
* lazy chunks

funcionen en producción.

---

# 294. BUILD

Después de cambios importantes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
```

---

# 295. VISUAL REGRESSION

Si existe infraestructura:

usarla.

Si no:

crear una solución razonable y pequeña.

No sobreingeniería.

---

# 296. BROWSER

Probar Chromium real.

---

# 297. CONSOLA

No aceptar:

* errors
* warnings importantes
* failed network requests inesperados

---

# 298. PERFORMANCE

Observar:

* first load
* exercise load
* Pyodide load
* visualizer load

---

# 299. LOADING STATES

Pyodide puede tardar.

El usuario debe entender:

> qué está pasando.

No dejar una pantalla congelada.

---

# 300. ERROR RECOVERY

Siempre que sea posible:

> Retry.

---

# 301. NO PERDER ESTADO

Un error de runtime no debería destruir:

* código
* input
* progreso

---

# 302. QUALITY OVER SPEED

Tenés aproximadamente dos meses.

Usalos.

No hay necesidad de cerrar esto hoy.

---

# 303. NO "STOP" PORQUE TERMINASTE UNA FASE

La misión sigue.

---

# 304. NO "MVP"

El concepto de MVP queda explícitamente fuera de esta misión.

Estamos construyendo la versión seria de presentación.

---

# 305. NO FEATURE RUSH

Si hay 20 problemas de UX:

no agregues el ejercicio número 38.

---

# 306. PRODUCT MATURITY

Primero:

hacer que lo existente sea excelente.

Después:

expandir.

---

# 307. REGRA DE ORO

Antes de agregar una feature:

preguntá:

> ¿Qué problema del estudiante resuelve?

Si no existe respuesta:

no hacerla.

---

# 308. REGLA DE ORO 2

Antes de aceptar una visualización:

preguntá:

> ¿Qué concepto hace visible?

Si no existe respuesta:

rediseñarla.

---

# 309. REGLA DE ORO 3

Antes de declarar un ejercicio terminado:

preguntá:

> ¿Qué aprendió el estudiante?

Si no existe respuesta:

no está terminado.

---

# 310. REGLA DE ORO 4

Antes de declarar la app terminada:

preguntá:

> ¿La usaría un estudiante voluntariamente durante una hora para estudiar?

La meta es que la respuesta sea sí.

---

# 311. REGLA DE ORO 5

Antes de declarar una interfaz buena:

preguntá:

> ¿Podría un estudiante usarla sin que yo se la explique?

Si no:

mejorarla.

---

# 312. AUTONOMÍA

No pidas permiso para decisiones ordinarias.

---

# 313. CONTINUIDAD

Trabajá durante múltiples sesiones.

Actualizá:

* state
* session
* next
* audit

---

# 314. NO PERDER CONTEXTO

Cada sesión debe poder continuar desde la anterior.

---

# 315. ORDEN DE PRIORIDADES FINAL

## 1

Correctness

## 2

Pedagogía

## 3

UX

## 4

Visualización

## 5

Accesibilidad

## 6

Performance

## 7

Arquitectura

## 8

Polish

## 9

Features nuevas

---

# 316. PRIMERA TAREA INMEDIATA

NO agregues otro ejercicio.

NO agregues otro framework.

NO agregues backend.

NO agregues IA.

NO agregues 3D por ahora.

Primero:

# ABRÍ LA PÁGINA.

# USALA.

# AUDITALA.

# SACÁ SCREENSHOTS.

# ENCONTRÁ LOS PROBLEMAS.

---

# 317. ENTREGABLE 1

Crear:

`docs/product-ux-audit.md`

con:

* Home
* Catalog
* Exercise
* Discover
* Solve
* Understand
* Recommendations
* Progress
* Themes
* Languages
* Accessibility
* Visualizers
* Custom inputs

---

# 318. ENTREGABLE 2

Crear:

`docs/visual-design-system.md`

con:

* colores
* estados
* tipografía
* spacing
* paneles
* botones
* gráficos
* visual semantics
* light/dark

---

# 319. ENTREGABLE 3

Actualizar:

`docs/exercise-quality-matrix.md`

para reflejar calidad REAL.

---

# 320. ENTREGABLE 4

Crear:

`docs/pedagogical-language-guide.md`

---

# 321. ENTREGABLE 5

Actualizar:

`docs/known-issues.md`

---

# 322. ENTREGABLE 6

Actualizar:

`IA/architect/state.md`

sin mentiras.

---

# 323. ENTREGABLE 7

Actualizar:

`IA/architect/next.md`

con trabajo real.

---

# 324. ENTREGABLE 8

Session log.

---

# 325. DESPUÉS DE LA AUDITORÍA

Ordenar problemas.

Luego corregir P0/P1.

Luego P2.

Luego P3.

Luego P4.

---

# 326. NO CORREGIR TODO A CIEGAS

Agrupar problemas sistémicos.

---

# 327. EJEMPLO

Si 20 gráficos son demasiado pequeños:

primero resolver:

> layout system.

Después ajustar casos particulares.

---

# 328. EJEMPLO 2

Si Light falla en 30 gráficos:

primero resolver:

> visual color semantics.

No 30 parches aislados.

---

# 329. EJEMPLO 3

Si recomendaciones llevan a lugares incorrectos:

resolver:

> navigation contract.

---

# 330. EJEMPLO 4

Si todos los playgrounds tienen inputs rígidos:

crear:

> reusable custom-case capability.

---

# 331. NO HACER UN SISTEMA GIGANTE

La abstracción debe surgir de problemas reales observados.

---

# 332. PRUEBA FINAL DE CADA CAMBIO

Después de cambiar:

* lint
* typecheck
* tests
* build
* browser
* visual review

cuando corresponda.

---

# 333. HUMAN QA

No olvidarlo.

---

# 334. "DOS MINUTOS" TEST

Una de las señales más importantes de esta misión:

El usuario encontró múltiples problemas en aproximadamente dos minutos de navegación casual.

Eso significa que:

# EL PROCESO DE AUDITORÍA ANTERIOR NO FUE SUFICIENTE.

No lo interpretes como una crítica aislada.

Es una señal de proceso.

Si un estudiante puede encontrar problemas obvios rápidamente:

hay problemas sistémicos.

---

# 335. NO DEFENDER EL TRABAJO ANTERIOR

No digas:

> "Pero los tests pasan."

No digas:

> "Pero el visualizador existe."

No digas:

> "Pero la matriz dice VERIFIED."

La pregunta ahora es:

> "¿Está realmente bien?"

---

# 336. BUSCAR ACTIVAMENTE DEFECTOS

No intentar demostrar que la app está bien.

Intentar encontrar dónde está mal.

---

# 337. RED TEAM DE UX

Pensá:

> "¿Cómo podría esta interfaz confundir a un estudiante?"

---

# 338. RED TEAM PEDAGÓGICO

Pensá:

> "¿Cómo podría un estudiante terminar este ejercicio sin aprender?"

---

# 339. RED TEAM VISUAL

Pensá:

> "¿Cómo podría este gráfico comunicar algo incorrecto o insuficiente?"

---

# 340. RED TEAM DE NAVEGACIÓN

Pensá:

> "¿Dónde podría perderse?"

---

# 341. RED TEAM DE IDIOMA

Pensá:

> "¿Dónde podría aparecer una palabra en el idioma equivocado?"

---

# 342. RED TEAM LIGHT MODE

Pensá:

> "¿Qué parte podría quedar ilegible?"

---

# 343. RED TEAM INTERACCIÓN

Pensá:

> "¿Qué debería poder manipular el estudiante y actualmente no puede?"

---

# 344. RED TEAM EJEMPLOS

Pensá:

> "¿Qué ejemplo hace que este algoritmo parezca trivial cuando no lo es?"

---

# 345. RED TEAM GRÁFICOS

Pensá:

> "¿Qué gráfico podría reemplazarse por una representación mucho mejor?"

---

# 346. RED TEAM SPACE

Pensá:

> "¿Dónde estoy desperdiciando espacio horizontal?"

---

# 347. RED TEAM CONTENT

Pensá:

> "¿Qué texto debería ser visual y qué gráfico debería tener explicación?"

---

# 348. NO PARAR EN LOS 10 EJERCICIOS

Los 10 son para encontrar patrones.

Luego auditar los 37.

---

# 349. NO DAR POR BUENOS LOS VISUALIZADORES NUEVOS

Especialmente los creados recientemente.

Que tengan:

```text
Visualizer.tsx
Playground.tsx
Trace.ts
```

no significa que estén bien diseñados.

---

# 350. REVISAR LOS COMPONENTES NUEVOS

Especialmente:

* Interval Partitioning
* Minimize Lateness
* Karatsuba
* Majority Element
* Median of Medians
* Segmented Least Squares
* RNA
* Hamiltonian Cycle
* TSP Branch & Bound

Estos fueron implementados recientemente.

Auditarlos con especial cuidado.

---

# 351. NO CONFUNDIR DENSIDAD CON CALIDAD

Más elementos no significa más aprendizaje.

---

# 352. NO CONFUNDIR ANIMACIÓN CON INTERACTIVIDAD

Un video no es un playground.

---

# 353. NO CONFUNDIR PLAYGROUND CON APRENDIZAJE

Un playground necesita preguntas y feedback.

---

# 354. NO CONFUNDIR TEST CON COMPRENSIÓN

Pasar tests demuestra una propiedad de código.

No necesariamente comprensión conceptual.

---

# 355. NO CONFUNDIR SOLUCIÓN CON ENSEÑANZA

Mostrar código no explica por qué funciona.

---

# 356. NO CONFUNDIR COMPLEJIDAD CON BENCHMARK

O grandeza.

---

# 357. NO CONFUNDIR COLOR CON SIGNIFICADO

Cada color debe tener semántica.

---

# 358. NO CONFUNDIR MODERNIDAD CON GRADIENTES

Diseño serio.

---

# 359. NO CONFUNDIR MINIMALISMO CON VACÍO

Usar el espacio para organizar pensamiento.

---

# 360. NO CONFUNDIR SIMPLICIDAD CON SUPERFICIALIDAD

KISS significa:

> la solución más simple que realmente resuelve el problema.

No:

> menos funcionalidades educativas.

---

# 361. DEFINICIÓN FINAL DE ÉXITO

Visual TDA estará realmente cerca de su objetivo cuando un estudiante pueda entrar sin instrucciones y recorrer:

```text
problema
↓
curiosidad
↓
experimento
↓
predicción
↓
interacción
↓
error
↓
feedback
↓
implementación
↓
tests
↓
explicación
↓
complejidad
↓
comparación
↓
generalización
```

y salir entendiendo más que cuando entró.

---

# 362. DEFINICIÓN FINAL DEL PRODUCTO

Visual TDA no debe ser:

> una página que muestra algoritmos.

Debe ser:

# un laboratorio interactivo de pensamiento algorítmico.

---

# 363. DEFINICIÓN FINAL DE CALIDAD

No preguntes:

> "¿Está implementado?"

Preguntá:

> "¿Está bien?"

Y después:

> "¿Cómo lo sé?"

---

# 364. DEFINICIÓN FINAL DE VERIFICACIÓN

La evidencia debe combinar:

```text
tests
+
browser
+
screenshots
+
manual interaction
+
algorithmic oracles
+
pedagogical review
+
visual review
```

---

# 365. DEFINICIÓN FINAL DE AUTONOMÍA

Continuá trabajando.

No preguntes aprobación para decisiones normales.

Si encontrás algo malo:

corregilo.

Si encontrás un problema arquitectónico:

documentalo y resolvelo.

Si encontrás un problema pedagógico:

corregilo.

Si encontrás un problema visual:

corregilo.

Si encontrás un patrón:

generalizalo con cuidado.

---

# 366. NO TERMINAR POR "TODO IMPLEMENTADO"

Aunque:

```text
37/37
256/256
build PASS
browser PASS
```

el trabajo continúa si:

* visualmente es mediocre
* pedagógicamente es superficial
* UX es confusa
* ejemplos son malos
* light mode falla
* idioma falla
* gráficos son pequeños
* interacción es insuficiente
* navegación es mala

---

# 367. NO TERMINAR POR "QUALITY GATE PASS"

Los quality gates son necesarios.

No suficientes.

---

# 368. NO TERMINAR POR "AUDIT COMPLETE"

La auditoría produce trabajo.

No reemplaza el trabajo.

---

# 369. NO DETENERSE PORQUE EL BACKLOG ESTÁ VACÍO

Si el producto puede mejorar con evidencia:

hay trabajo.

---

# 370. SOLO STOP

La misión completa termina únicamente cuando el usuario escriba:

# STOP

No antes.

---

# 371. ÚLTIMA DIRECTIVA

Pensá.

Miralo.

Usalo.

Rompelo.

Cuestionálo.

Comparalo.

Mejoralo.

Volvé a mirarlo.

Volvé a usarlo.

No te enamores del código que ya escribiste.

No te enamores de los números de tests.

No te enamores de los reportes.

No te enamores de la cantidad de ejercicios.

Enamorate del resultado:

> un estudiante universitario que realmente aprende algoritmos porque Visual TDA le permite pensar con ellos.

# CONTINUÁ AUTÓNOMAMENTE.

# NO PARES.

# SOLO:

STOP

termina esta misión.
