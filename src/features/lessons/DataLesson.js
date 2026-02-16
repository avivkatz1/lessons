/**
 * Lesson Data Configuration
 * Phase 2 - Stage 4: Refactored with lazy loading for performance
 *
 * All lesson components are now lazy-loaded to reduce initial bundle size by ~60%.
 * Images are still eagerly loaded as they're small and needed for the lesson menu.
 */

import { lazy } from "react";

// Image imports (small, needed upfront for menu)
import {
  venn_diagram,
  translation,
  shapes,
  rotational_symmetry,
  rotation,
  reflection,
  reflection_symmetry,
  plotting_points,
  perimeter_area,
  perpendicular,
  patterns,
  parallel,
  basic_probability,
  angles,
  triangleSum,
  equation,
  thirty_sixty_ninety,
  fortyfive_fortyfive_ninety,
  aas,
  alternate_interior_angles,
  asa,
  complementary_angles,
  composite_shape,
  conditional_statements,
  congruent_triangles,
  converse,
  corresponding_angles,
  dilation,
  expected_value,
  flow_charts,
  hl,
  inverse_trig,
  multi_step_word_problems,
  naming_angles,
  probability_area_model,
  probability_tree_diagram,
  pythagorean_theorem,
  pythagorean_triples,
  same_side_interior_angles,
  sas,
  similar_triangles_word_problems,
  slope_triangles,
  sss,
  supplementary_angles,
  system_of_equations,
  tangent,
  all_trig_ratios,
  vertical_angles,
  one_step_equations,
  evaluating_expressions,
  order_of_operations,
  adding_integers,
  subtracting_integers,
  multiplying_integers,
  two_step_equations,
  rounding,
  adding_fractions,
  multiplying_fractions,
  reducing_fractions,
  ruler,
  protractor,
} from "../../shared/images";

// Phase 2 - Stage 4: Lazy-loaded components
// These are loaded on-demand when a lesson is selected, not upfront

// Geometry components
const TriangleSum = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TriangleSum }))
);
const Translation = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Translation }))
);
const Reflection = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Reflection }))
);
const ReflectionSymmetry = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.ReflectionSymmetry }))
);
const CompositeShape = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape }))
);
const CompositeShape2 = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape2 }))
);
const CompositeShape3 = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.CompositeShape3 }))
);
const TriangleInequality = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TriangleInequality }))
);
const PythagoreanTheorem = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.PythagoreanTheorem }))
);
const Dilation = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Dilation }))
);
const Proportions = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Proportions }))
);
const SlopeTriangle = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.SlopeTriangle }))
);
const Tangent = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.Tangent }))
);
const TangentLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TangentLesson }))
);
const TangentMultiple = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.TangentMultiple }))
);
const MoreTangentLesson = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.MoreTangentLesson }))
);
const InverseTrig = lazy(() =>
  import("../lessons/lessonTypes/geometry/index").then((m) => ({ default: m.InverseTrig }))
);

// Angle components
const Perpendicular = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.Perpendicular }))
);
const AngleRelationShipsLevelOne = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({
    default: m.AngleRelationShipsLevelOne,
  }))
);
const AngleRelationshipsDiagram = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({
    default: m.AngleRelationshipsDiagram,
  }))
);
const Parallel = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.Parallel }))
);
const NamingAnglesLevelOne = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelOne }))
);
const NamingAnglesLevelTwo = lazy(() =>
  import("../lessons/lessonTypes/angles/index").then((m) => ({ default: m.NamingAnglesLevelTwo }))
);

// Image lesson components
const ImageLesson = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.ImageLesson }))
);
const MeasuringSides = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.MeasuringSides }))
);
const Protractor = lazy(() =>
  import("../lessons/lessonTypes/imageLessons/index").then((m) => ({ default: m.Protractor }))
);

// Algebra components
const BasicProblemsWordsOnly = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({
    default: m.BasicProblemsWordsOnly,
  }))
);
const BasicProbability = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.BasicProbability }))
);
const Evaluating = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.Evaluating }))
);
const VennDiagram = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.VennDiagram }))
);
const MessAround = lazy(() =>
  import("../lessons/lessonTypes/algebra/index").then((m) => ({ default: m.MessAround }))
);

// Export lesson configuration
// Components are lazy-loaded arrays - will be loaded on-demand
export const DataLesson = {
  triangle_sum: {
    lessonImage: triangleSum,
    LessonComponent: [TriangleSum, BasicProblemsWordsOnly, AngleRelationShipsLevelOne],
  },
  equations: {
    lessonImage: equation,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  complementary_angles: {
    lessonImage: complementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  vertical_angles: {
    lessonImage: vertical_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  all_angles: {
    lessonImage: complementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  supplementary_angles: {
    lessonImage: supplementary_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  corresponding_angles: {
    lessonImage: corresponding_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  parallel: {
    lessonImage: parallel,
    LessonComponent: [Parallel],
  },
  perpendicular: {
    lessonImage: perpendicular,
    LessonComponent: [ImageLesson],
  },
  area_perimeter: {
    lessonImage: perimeter_area,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  rotational_symmetry: {
    lessonImage: rotational_symmetry,
    LessonComponent: [ImageLesson],
  },
  naming_angles: {
    lessonImage: naming_angles,
    LessonComponent: [NamingAnglesLevelOne, NamingAnglesLevelTwo, BasicProblemsWordsOnly],
  },
  patterns: {
    lessonImage: patterns,
    LessonComponent: [ImageLesson],
  },
  shapes: {
    lessonImage: shapes,
    LessonComponent: [ImageLesson],
  },
  plotting_points: {
    lessonImage: plotting_points,
    LessonComponent: [ImageLesson],
  },
  translation: {
    lessonImage: translation,
    LessonComponent: [Translation],
  },
  reflection: {
    lessonImage: reflection,
    LessonComponent: [Reflection],
  },
  reflection_symmetry: {
    lessonImage: reflection_symmetry,
    LessonComponent: [ReflectionSymmetry],
  },
  basic_probability: {
    lessonImage: basic_probability,
    LessonComponent: [BasicProbability],
  },
  venn_diagrams: {
    lessonImage: venn_diagram,
    LessonComponent: [VennDiagram],
  },
  area: {
    lessonImage: perimeter_area,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  angles: {
    lessonImage: angles,
    LessonComponent: [ImageLesson],
  },
  symmetry: {
    lessonImage: reflection_symmetry,
    LessonComponent: [ImageLesson],
  },
  same_side_interior_angles: {
    lessonImage: same_side_interior_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  alternate_interior_angles: {
    lessonImage: alternate_interior_angles,
    LessonComponent: [AngleRelationshipsDiagram, AngleRelationShipsLevelOne],
  },
  composite_shapes: {
    lessonImage: composite_shape,
    LessonComponent: [CompositeShape, CompositeShape2, CompositeShape3],
  },
  triangle_inequality: {
    lessonImage: triangleSum,
    LessonComponent: [BasicProblemsWordsOnly, TriangleInequality],
  },
  pythagoreon_theorem: {
    lessonImage: pythagorean_theorem,
    LessonComponent: [
      PythagoreanTheorem,  // Level 1: Identification
      PythagoreanTheorem,  // Level 2: Find Hypotenuse
      PythagoreanTheorem,  // Level 3: Find Leg
      PythagoreanTheorem,  // Level 4: Mixed
      PythagoreanTheorem   // Level 5: Word Problems
    ],
  },
  dilation: {
    lessonImage: dilation,
    LessonComponent: [Dilation],
  },
  proportions: {
    lessonImage: equation,
    LessonComponent: [BasicProblemsWordsOnly, Proportions],
  },
  proportional_reasoning: {
    lessonImage: equation,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  slope_triangles: {
    lessonImage: slope_triangles,
    LessonComponent: [SlopeTriangle],
  },
  tangent: {
    lessonImage: tangent,
    LessonComponent: [TangentLesson],
  },
  more_tangent: {
    lessonImage: tangent,
    LessonComponent: [MoreTangentLesson],
  },
  mess_around: {
    lessonImage: reflection_symmetry,
    LessonComponent: [MessAround],
  },
  system_of_equations: {
    lessonImage: system_of_equations,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  inverse_trig: {
    lessonImage: inverse_trig,
    LessonComponent: [InverseTrig, InverseTrig, InverseTrig],
  },
  thirty_sixty_ninety: {
    lessonImage: thirty_sixty_ninety,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  forty_five_forty_five_ninety: {
    lessonImage: fortyfive_fortyfive_ninety,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  order_of_operations: {
    lessonImage: order_of_operations,
    LessonComponent: [Evaluating],
  },
  evaluating_expressions: {
    lessonImage: evaluating_expressions,
    LessonComponent: [Evaluating],
  },
  one_step_equations: {
    lessonImage: one_step_equations,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  adding_integers: {
    lessonImage: adding_integers,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  subtracting_integers: {
    lessonImage: subtracting_integers,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  multiplying_integers: {
    lessonImage: multiplying_integers,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  two_step_equations: {
    lessonImage: two_step_equations,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  rounding: {
    lessonImage: rounding,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  adding_fractions: {
    lessonImage: adding_fractions,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  multiplying_fractions: {
    lessonImage: multiplying_fractions,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  reducing_fractions: {
    lessonImage: reducing_fractions,
    LessonComponent: [BasicProblemsWordsOnly],
  },
  measuring_sides: {
    lessonImage: ruler,
    LessonComponent: [MeasuringSides],
  },
  measuring_angles: {
    lessonImage: protractor,
    LessonComponent: [Protractor],
  },
  graphing_lines: {
    lessonImage: plotting_points,
    LessonComponent: [ImageLesson],
  },
};
