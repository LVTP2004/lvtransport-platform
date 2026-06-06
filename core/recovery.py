from LVTP.core.registry import load_registry

def recover(service_name):
    reg = load_registry()
    svc = reg["canonical"][service_name]

    recovery = svc.get("recovery")

    if recovery == "verify_local_workspace":
        return "LOCAL_WORKSPACE_OK"

    if recovery == "verify_ops":
        return "OPS_OK"

    if recovery == "verify_local_agents":
        return "AGENTS_OK"

    if recovery == "manual_sync_to_vps":
        return "SYNC_REQUIRED"

    return f"UNKNOWN_RECOVERY:{recovery}"

if __name__ == "__main__":
    reg = load_registry()

    for name in reg["canonical"]:
        print(name, "=>", recover(name))
