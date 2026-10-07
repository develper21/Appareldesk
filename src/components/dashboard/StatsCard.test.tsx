import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IndianRupee } from "lucide-react";
import { StatsCard } from "./StatsCard";

describe("StatsCard (dashboard)", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Total Revenue" value="₹1,24,500" icon={IndianRupee} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("₹1,24,500")).toBeInTheDocument();
  });

  it("renders numeric values", () => {
    render(<StatsCard title="Orders" value={128} icon={IndianRupee} />);
    expect(screen.getByText("128")).toBeInTheDocument();
  });

  it("styles positive changes with the success color", () => {
    render(<StatsCard title="Sales" value={40} change="+12% this month" changeType="positive" icon={IndianRupee} />);
    const change = screen.getByText("+12% this month");
    expect(change).toBeInTheDocument();
    expect(change).toHaveClass("text-success");
  });

  it("styles negative changes with the destructive color", () => {
    render(<StatsCard title="Sales" value={40} change="-4% this month" changeType="negative" icon={IndianRupee} />);
    expect(screen.getByText("-4% this month")).toHaveClass("text-destructive");
  });

  it("hides the change line when not provided", () => {
    render(<StatsCard title="Sales" value={40} icon={IndianRupee} />);
    expect(screen.queryByText(/this month/)).not.toBeInTheDocument();
  });

  it("accepts a custom index for staggered animation delay", () => {
    render(<StatsCard title="Sales" value={40} icon={IndianRupee} index={3} />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });
});
