using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LFOPosition : BaseLFO
{
    Transform tr;
    Vector3 orgPosition = new Vector3();

    void Start()
    {
        tr = gameObject.transform;
        orgPosition.x = tr.position.x;
        orgPosition.y = tr.position.y;
        orgPosition.z = tr.position.z;
    }

    // Update is called once per frame
    void Update()
    {
        tr.position = new Vector3(orgPosition.x + lfoAmp0 * (Easing.Bounce.InOut(t0) * 2 - 1),
                                  orgPosition.y + lfoAmp1 * (Easing.Bounce.InOut(t1) * 2 - 1),
                                  orgPosition.z + lfoAmp2 * (Easing.Bounce.InOut(t2) * 2 - 1));
    }
}
