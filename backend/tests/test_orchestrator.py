import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from cosmic_orchestrator.agent import orchestrator, classify_intent

def run_tests():
    evalset_path = os.path.join(os.path.dirname(__file__), 'specs', 'evalsets', 'orchestrator.evalset.json')
    with open(evalset_path, 'r', encoding='utf-8') as f:
        evalset = json.load(f)

    print(f"Running Evalset: {evalset['eval_set_id']}")
    print("-" * 50)
    
    pass_count = 0
    for case in evalset['cases']:
        print(f"\nCase ID: {case['case_id']}")
        print(f"Input: \"{case['input']}\"")
        
        expected_route = case['expected_route']
        
        # process message
        output = orchestrator.process_message(case['input'])
        
        final_route = classify_intent(case['input'])
        if "grown-up" in output:
             final_route = "coach-kai" # The distress override
        elif "What would you like" in output:
             final_route = "none"
             
        tool_sequence = [t['tool'] for t in orchestrator.trajectory_log]
        print(f"  Routed to: {final_route}")
        print(f"  Trajectory: {' -> '.join(tool_sequence)}")
        
        passed = True
        
        # Validate trajectory IN_ORDER
        expected_tools = [t['tool'] for t in case.get('expected_tool_calls', [])]
        if expected_tools:
             last_idx = -1
             for et in expected_tools:
                 try:
                     # find et in tool_sequence AFTER last_idx
                     idx = tool_sequence.index(et, last_idx + 1)
                     last_idx = idx
                 except ValueError:
                     passed = False
                     print(f"    - Failed IN_ORDER: {et} was out of sequence or missing after index {last_idx}.")
                     break

        if case['type'] != 'distress' and final_route != expected_route:
             passed = False
             print(f"    - Failed Routing: Expected {expected_route}, got {final_route}")

        print(f"  Result: {'PASS' if passed else 'FAIL'}")
        if passed: pass_count += 1
        
    print("\n" + "=" * 50)
    print(f"Summary: {pass_count}/{len(evalset['cases'])} PASSED.")
    if pass_count >= len(evalset['cases']) * 0.9:
        print(">= 90% ROUTING ACCURACY ACHIEVED.")
    else:
        print("PIPELINE FAILED accuracy target.")

if __name__ == "__main__":
    run_tests()
