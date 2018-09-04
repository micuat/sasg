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
        tr.position = new Vector3(orgPosition.x + lfo0,
                                  orgPosition.y + lfo1,
                                  orgPosition.z + lfo2);
    }
}
