import json
import sys

from shapely.geometry import Point, Polygon
from shapely.ops import unary_union

### 注視判定面積の計算を行うプログラム ###


def calculate_fill_ratio(points, rectangle_bounds, radius):
    """
    指定された点のリストに基づいて円を生成し、指定された四角形の範囲内での充填率を計算する関数。

    :param points: 2次元空間内の点のリスト。
    :param rectangle_bounds: 四角形の範囲を示す(x_min, y_min, x_max, y_max)のタプル。
    :param radius: 円の半径。
    :return: 四角形の範囲内での充填率。
    """
    # 四角形の範囲を定義
    x_min, y_min, x_max, y_max = rectangle_bounds
    rectangle = Polygon(
        [(x_min, y_min), (x_max, y_min), (x_max, y_max), (x_min, y_max)]
    )

    # 円の面積と重なりの計算
    circles = [Point(point).buffer(radius) for point in points]
    combined_circles = unary_union(circles)
    overlap_area = combined_circles.intersection(rectangle).area

    # 四角形の面積
    rect_area = rectangle.area

    # 充填率の計算
    fill_ratio = overlap_area / rect_area
    return fill_ratio


data = json.loads(sys.argv[1])
points = data["points"]
rectangle_bounds = data["rectangle_bounds"]
radius = data["radius"]

fill_ratio = calculate_fill_ratio(points, rectangle_bounds, radius)
print(f"{fill_ratio:.2f}")
