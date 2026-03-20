"""
FluxStock — Demand Forecasting & Reorder Point Calculator.

This module is a standalone Python package used by the backend API.
It uses pandas for time-series aggregation and implements
the classic (d × L) + SS reorder point formula.
"""

from __future__ import annotations

import pandas as pd


def calculate_reorder_point(
    movements: list[dict],
    lead_time_days: int = 7,
    max_lead_time_days: int | None = None,
) -> dict:
    """
    Calculate the reorder point (RP) from historical OUT movements.

    Parameters
    ----------
    movements : list[dict]
        Each dict has {"timestamp": datetime, "quantity": int (positive)}.
        These should be OUT movements from the last ~90 days.
    lead_time_days : int
        Average supplier lead time in days.
    max_lead_time_days : int | None
        Maximum supplier lead time. Defaults to lead_time_days × 1.5.

    Returns
    -------
    dict with keys:
        avg_daily_demand, max_daily_demand, safety_stock, reorder_point

    Formulas
    --------
    - d   = average daily demand (rolling mean over the period)
    - d_max = maximum daily demand observed
    - L   = lead_time_days
    - L_max = max_lead_time_days
    - SS  = (d_max × L_max) − (d × L)
    - RP  = (d × L) + SS
    """
    if max_lead_time_days is None:
        max_lead_time_days = int(lead_time_days * 1.5)

    # ── Edge case: no movements ────────────────────
    if not movements:
        return {
            "avg_daily_demand": 0.0,
            "max_daily_demand": 0.0,
            "safety_stock": 0.0,
            "reorder_point": 0.0,
        }

    # ── Build a daily demand series ────────────────
    df = pd.DataFrame(movements)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["date"] = df["timestamp"].dt.date

    daily = df.groupby("date")["quantity"].sum().reset_index()
    daily.columns = ["date", "demand"]

    # Fill missing days with 0
    date_range = pd.date_range(start=daily["date"].min(), end=daily["date"].max(), freq="D")
    daily = daily.set_index("date").reindex(date_range, fill_value=0).reset_index()
    daily.columns = ["date", "demand"]

    # ── Compute metrics ────────────────────────────
    d_avg = float(daily["demand"].mean())
    d_max = float(daily["demand"].max())

    L = lead_time_days
    L_max = max_lead_time_days

    # Safety Stock: SS = (d_max × L_max) − (d_avg × L)
    ss = max((d_max * L_max) - (d_avg * L), 0.0)

    # Reorder Point: RP = (d_avg × L) + SS
    rp = (d_avg * L) + ss

    return {
        "avg_daily_demand": round(d_avg, 2),
        "max_daily_demand": round(d_max, 2),
        "safety_stock": round(ss, 2),
        "reorder_point": round(rp, 2),
    }
