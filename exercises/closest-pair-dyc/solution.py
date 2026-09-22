import math

def par_mas_cercano(puntos: list[tuple[float, float]]) -> float:
    """
    Calcula la distancia minima entre n puntos en R^2 en O(n log n).
    """
    puntos_x = sorted(puntos, key=lambda p: p[0])
    puntos_y = sorted(puntos, key=lambda p: p[1])
    
    def distancia(p1, p2):
        return math.hypot(p1[0] - p2[0], p1[1] - p2[1])
        
    def resolver(px, py):
        n = len(px)
        if n <= 3:
            min_d = float('inf')
            for i in range(n):
                for j in range(i + 1, n):
                    min_d = min(min_d, distancia(px[i], px[j]))
            return min_d
            
        mid = n // 2
        mid_x = px[mid][0]
        
        izq_x = px[:mid]
        der_x = px[mid:]
        izq_y = [p for p in py if p[0] <= mid_x]
        der_y = [p for p in py if p[0] > mid_x]
        
        d1 = resolver(izq_x, izq_y)
        d2 = resolver(der_x, der_y)
        delta = min(d1, d2)
        
        franja = [p for p in py if abs(p[0] - mid_x) < delta]
        for i in range(len(franja)):
            for j in range(i + 1, min(i + 8, len(franja))):
                delta = min(delta, distancia(franja[i], franja[j]))
                
        return delta

    return resolver(puntos_x, puntos_y)
