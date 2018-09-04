using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LFORotation : BaseLFO {
    Transform tr;
    Vector3 orgRotation = new Vector3();

    void Start()
    {
        tr = gameObject.transform;
        orgRotation.x = tr.eulerAngles.x;
        orgRotation.y = tr.eulerAngles.y;
        orgRotation.z = tr.eulerAngles.z;
    }

    // Update is called once per frame
	void Update () {
        base.UpdateTime();
        tr.eulerAngles = new Vector3(orgRotation.x + lfoAmp0 * (Easing.Bounce.InOut(t0) * 2 - 1),
                                     orgRotation.y + lfoAmp1 * (Easing.Bounce.InOut(t1) * 2 - 1),
                                     orgRotation.z + lfoAmp2 * (Easing.Bounce.InOut(t2) * 2 - 1));
	}
}
