import pandas as pd
import streamlit as st


def build_tables() -> dict[str, pd.DataFrame]:
    """Create mock tables used across all levels."""
    team = pd.DataFrame(
        [
            {"id": 1, "name": "Ava", "role": "Engineer", "active": True, "city": "Berlin"},
            {"id": 2, "name": "Liam", "role": "Designer", "active": True, "city": "Paris"},
            {"id": 3, "name": "Noah", "role": "Engineer", "active": False, "city": "London"},
            {"id": 4, "name": "Emma", "role": "Manager", "active": True, "city": "Madrid"},
            {"id": 5, "name": "Mia", "role": "Analyst", "active": False, "city": "Rome"},
            {"id": 6, "name": "Ethan", "role": "Engineer", "active": True, "city": "Dublin"},
            {"id": 7, "name": "Olivia", "role": "QA", "active": True, "city": "Prague"},
            {"id": 8, "name": "Lucas", "role": "Engineer", "active": False, "city": "Vienna"},
            {"id": 9, "name": "Sophia", "role": "Designer", "active": True, "city": "Lisbon"},
            {"id": 10, "name": "Mason", "role": "Support", "active": True, "city": "Oslo"},
            {"id": 11, "name": "Isabella", "role": "Engineer", "active": False, "city": "Warsaw"},
            {"id": 12, "name": "James", "role": "Manager", "active": True, "city": "Helsinki"},
        ]
    )

    projects = pd.DataFrame(
        [
            {"project_id": 101, "project": "Atlas", "owner": "Ava", "budget": 120000, "status": "active"},
            {"project_id": 102, "project": "Nova", "owner": "Liam", "budget": 80000, "status": "active"},
            {"project_id": 103, "project": "Pulse", "owner": "Emma", "budget": 200000, "status": "paused"},
            {"project_id": 104, "project": "Orion", "owner": "Ethan", "budget": 150000, "status": "active"},
            {"project_id": 105, "project": "Echo", "owner": "Mia", "budget": 60000, "status": "archived"},
            {"project_id": 106, "project": "Flare", "owner": "Noah", "budget": 110000, "status": "active"},
            {"project_id": 107, "project": "Summit", "owner": "Olivia", "budget": 95000, "status": "paused"},
            {"project_id": 108, "project": "Vertex", "owner": "James", "budget": 175000, "status": "active"},
            {"project_id": 109, "project": "Breeze", "owner": "Sophia", "budget": 70000, "status": "active"},
            {"project_id": 110, "project": "Harbor", "owner": "Lucas", "budget": 130000, "status": "archived"},
            {"project_id": 111, "project": "Zenith", "owner": "Isabella", "budget": 105000, "status": "active"},
            {"project_id": 112, "project": "Drift", "owner": "Mason", "budget": 50000, "status": "paused"},
        ]
    )
    return {"team": team, "projects": projects}


def build_levels() -> list[dict]:
    """Level metadata and evaluation logic."""
    return [
        {
            "name": "Level 1",
            "objective": "Simple projection: select only the requested columns from all rows.",
            "query": "SELECT name, role FROM team",
            "table": "team",
            "result": lambda tables: tables["team"][["name", "role"]],
        },
        {
            "name": "Level 2",
            "objective": "Selection/filtering: return only rows that match the WHERE clause.",
            "query": "SELECT * FROM team WHERE active = True",
            "table": "team",
            "result": lambda tables: tables["team"][tables["team"]["active"]].reset_index(drop=True),
        },
        {
            "name": "Level 3",
            "objective": "Combine projection and selection.",
            "query": "SELECT project, owner FROM projects WHERE budget > 100000 AND status = 'active'",
            "table": "projects",
            "result": lambda tables: tables["projects"][
                (tables["projects"]["budget"] > 100000) & (tables["projects"]["status"] == "active")
            ][["project", "owner"]].reset_index(drop=True),
        },
    ]


def normalize(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize for strict equality checks."""
    return df.reset_index(drop=True)


def evaluate_selection(
    level: dict,
    tables: dict[str, pd.DataFrame],
    selected_table: str,
    selected_columns: list[str],
    selected_rows: list[int],
) -> tuple[bool, str]:
    expected = normalize(level["result"](tables))

    if selected_table != level["table"]:
        return False, f"Incorrect table. This level needs data from `{level['table']}`."

    source_df = tables[selected_table]
    if not selected_columns:
        return False, "No columns selected. Check the SELECT clause."

    if not selected_rows:
        return False, "No rows selected. Check the WHERE clause."

    chosen_df = source_df.loc[selected_rows, selected_columns]
    chosen_df = normalize(chosen_df)

    expected_columns = list(expected.columns)
    if selected_columns != expected_columns:
        missing = [col for col in expected_columns if col not in selected_columns]
        extras = [col for col in selected_columns if col not in expected_columns]
        if missing:
            return False, f"Missing columns from SELECT: {missing}"
        if extras:
            return False, f"Extra columns selected that are not in SELECT: {extras}"
        return False, "Column order does not match the SELECT statement order."

    if len(selected_rows) != len(expected):
        return False, "Incorrect number of rows selected. Re-check the WHERE clause."

    if chosen_df.equals(expected):
        return True, "Query executed successfully! You matched the result set."

    return False, "Incorrect. You selected rows that don't match the WHERE clause."


def init_state() -> None:
    if "level_index" not in st.session_state:
        st.session_state.level_index = 0
    if "level_complete" not in st.session_state:
        st.session_state.level_complete = False
    if "feedback" not in st.session_state:
        st.session_state.feedback = ""


def main() -> None:
    st.set_page_config(page_title="SELECT * FROM Me", layout="wide")
    init_state()
    tables = build_tables()
    levels = build_levels()

    level = levels[st.session_state.level_index]
    st.title("SELECT * FROM Me")
    st.subheader(f"{level['name']} — {level['query']}")
    st.caption(level["objective"])

    st.markdown("### Tables")
    table_names = list(tables.keys())
    tabs = st.tabs(table_names)

    active_table = st.radio("Select table for your answer", table_names, horizontal=True)
    selected_columns = st.multiselect(
        "Choose columns to return (SELECT)",
        options=list(tables[active_table].columns),
        default=[],
    )
    selected_rows = st.multiselect(
        "Choose row indices to return (WHERE)",
        options=list(tables[active_table].index),
        default=[],
        help="Row indices are shown in the leftmost index column.",
    )

    for tab, table_name in zip(tabs, table_names):
        with tab:
            st.write(f"**{table_name}**")
            st.data_editor(tables[table_name], use_container_width=True, disabled=True, hide_index=False)

    st.markdown("### Action Panel")
    if st.button("Run Query / Submit Selection", type="primary"):
        success, feedback = evaluate_selection(level, tables, active_table, selected_columns, selected_rows)
        st.session_state.level_complete = success
        st.session_state.feedback = feedback

    if st.session_state.feedback:
        if st.session_state.level_complete:
            st.success(st.session_state.feedback)
        else:
            st.error(st.session_state.feedback)

    if st.session_state.level_complete:
        if st.session_state.level_index < len(levels) - 1:
            if st.button("Next Level"):
                st.session_state.level_index += 1
                st.session_state.level_complete = False
                st.session_state.feedback = ""
                st.rerun()
        else:
            st.balloons()
            st.success("You completed all MVP levels. 🎉")


if __name__ == "__main__":
    main()
