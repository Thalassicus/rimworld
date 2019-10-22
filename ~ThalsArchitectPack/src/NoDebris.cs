using Verse;
using HugsLib;
using Harmony;

namespace NoDebris
{
    public class NoDebris : ModBase
    {
        public override string ModIdentifier
        {
            get { return "NoDebris"; }
        }
    }

    // original method: public override bool Verse.SectionLayer_TerrainScatter.Visible
    [HarmonyPatch(typeof(SectionLayer_TerrainScatter), "Visible", MethodType.Getter)]

    internal static class HideTerrainScatter
    {
        [HarmonyPrefix]
        public static bool Patch_SectionLayer_TerrainScatter_Visible(SectionLayer_TerrainScatter __instance, ref bool __result)
        {
            __result = false;
            return false;
        }
    }
}
