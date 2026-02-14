"""Server-side cross-reference validation for structural models."""

from __future__ import annotations
from .models import Project, ValidationError


def validate_project(project: Project) -> list[ValidationError]:
    errors: list[ValidationError] = []

    node_ids: set[str] = set()
    for node in project.nodes:
        if node.id in node_ids:
            errors.append(ValidationError(
                path="nodes",
                message=f'Duplicate node ID: "{node.id}"',
            ))
        node_ids.add(node.id)

        if node.support.type == "spring" and node.support.spring_stiffness is None:
            errors.append(ValidationError(
                path=f"nodes.{node.id}.support",
                message=f'Node "{node.id}" has spring support but no spring_stiffness',
            ))

    member_ids: set[str] = set()
    for member in project.members:
        if member.id in member_ids:
            errors.append(ValidationError(
                path="members",
                message=f'Duplicate member ID: "{member.id}"',
            ))
        member_ids.add(member.id)

        if member.start_node not in node_ids:
            errors.append(ValidationError(
                path=f"members.{member.id}.start_node",
                message=f'Member "{member.id}" references non-existent start_node "{member.start_node}"',
            ))
        if member.end_node not in node_ids:
            errors.append(ValidationError(
                path=f"members.{member.id}.end_node",
                message=f'Member "{member.id}" references non-existent end_node "{member.end_node}"',
            ))
        if member.start_node == member.end_node:
            errors.append(ValidationError(
                path=f"members.{member.id}",
                message=f'Member "{member.id}" has identical start and end nodes',
            ))

    panel_ids: set[str] = set()
    for panel in project.panels:
        if panel.id in panel_ids:
            errors.append(ValidationError(
                path="panels",
                message=f'Duplicate panel ID: "{panel.id}"',
            ))
        panel_ids.add(panel.id)

        for nid in panel.node_ids:
            if nid not in node_ids:
                errors.append(ValidationError(
                    path=f"panels.{panel.id}.node_ids",
                    message=f'Panel "{panel.id}" references non-existent node "{nid}"',
                ))

    target_ids = member_ids | panel_ids
    load_case_names = {lc.name for lc in project.load_cases}
    load_ids: set[str] = set()

    for load in project.loads:
        if load.id in load_ids:
            errors.append(ValidationError(
                path="loads",
                message=f'Duplicate load ID: "{load.id}"',
            ))
        load_ids.add(load.id)

        if load.type != "self_weight" and load.target not in target_ids:
            errors.append(ValidationError(
                path=f"loads.{load.id}.target",
                message=f'Load "{load.id}" references non-existent target "{load.target}"',
            ))

        if load.case not in load_case_names:
            errors.append(ValidationError(
                path=f"loads.{load.id}.case",
                message=f'Load "{load.id}" references non-existent load case "{load.case}"',
            ))

    for combo in project.combinations:
        for factor in combo.factors:
            if factor.case not in load_case_names:
                errors.append(ValidationError(
                    path=f"combinations.{combo.name}.factors",
                    message=f'Combination "{combo.name}" references non-existent load case "{factor.case}"',
                ))

    return errors
